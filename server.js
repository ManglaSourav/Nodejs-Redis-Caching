import express from "express";
import "dotenv/config";
import process from "node:process";
import bodyParser from "body-parser";
import { connectToDB, fetchUser, updateUserBio } from "./db.js";
import { initializeRedisClient } from "./redis.js"
import { log } from "node:console";
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

let db;
let redisClient;

try {
	db = connectToDB(process.env.SQLITE_FILE);
	redisClient = await initializeRedisClient()
} catch (err) {
	console.error(err);
	process.exit();
}

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

async function getExchangeRates() {
	const response = await fetch(
		"https://api.coingecko.com/api/v3/exchange_rates",
		{
			headers: {
				Accept: "application/json",
			},
		},
	);
	return await response.json();
}


function redisCachingMiddleware(opts = {
	EX: 300,
}) {
	return async (req, res, next) => {
		try {
			const cacheKey = `${req.originalUrl}`;

			const cachedData = await redisClient.get(cacheKey);
			if (cachedData) {
				console.log(`Cache hit for ${req.originalUrl}`);
				// If data exists, parse and send the cached response
				const parsedData = JSON.parse(cachedData);
				return res.json(parsedData);
			}

			console.log(`Cache miss for ${req.originalUrl}`);
			// If data not in cache, proceed to the next middleware/route handler
			res.handlerSend = res.send; // Store original res.send
			res.send = async (body) => {
				res.send = res.handlerSend;

				// Cache the response data before sending it on 2xx codes only
				if (res.statusCode.toString().startsWith("2")) {
					await redisClient.set(cacheKey, body, opts);
				}

				return res.send(body);
			};

			next();

		} catch (error) {
			console.error("Error in redisCachingMiddleware:", error);
			next(error); // Pass the error to the error handling middleware

		}
	}

}


app.get("/btc-exchange-rate2/", redisCachingMiddleware(), async (req, res) => {
	try {
		// Fetch exchange data from the external API
		const data = await getExchangeRates();
		
		// Respond with API data
		res.status(200).json(data);
	} catch (error) {
		console.error("Error fetching exchange rate:", error.message);
		res.status(500).json({ error: "Unable to fetch data" });
	}
});


app.get(
	"/btc-exchange-rate/",
	async (req, res) => {
		const cacheKey = "btc-exchange-rate"
		const cacheExpiry = 300 // 5 mnutes
		try {


			const cachedData = await redisClient.get(cacheKey)
			if (cachedData) {
				console.log("Cache hit for BTC exchange rates");
				return res.status(200).json({
					source: "cache",
					data: JSON.parse(cachedData)
				})
			}

			console.log("Cache miss for BTC exchange rates");

			const data = await getExchangeRates();
			await redisClient.set(cacheKey, JSON.stringify(data), { EX: cacheExpiry })
			res.status(200).json({ source: "API", data });
		} catch (error) {
			console.error("Error fetching exchange rate:", error.message);
			res.status(500).json({ error: "Unable to fetch data" });
		}
	},
);

app.get("/users/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const userProfile = await fetchUser(db, id);
		if (!userProfile) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(userProfile);
	} catch (error) {
		console.error("Error fetching user:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.put("/users/:id/bio", async (req, res) => {
	const { id } = req.params;
	const { bio } = req.body;

	try {
		const userProfile = await fetchUser(db, id);

		userProfile.bio = bio.trim();

		await updateUserBio(db, id, userProfile.bio);

		res.json({ message: "User profile updated", user: userProfile });
	} catch (error) {
		console.error("Error updating user:", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
