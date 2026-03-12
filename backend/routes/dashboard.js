import express from "express"

const router = express.Router()

router.get("/", async (req, res) => {
    res.json({
        posts: [
            {
                id: 1,
                author: {
                    name: "FoundersKick",
                    avatar: "https://i.pravatar.cc/100"
                },
                content: "🚀 Backend fully connected!",
                timestamp: "Just now",
                likes: 12,
                comments: 4,
                shares: 1
            }
        ],
        trending: [],
        connections: [],
        status: {
            networkValue: "$120",
            progress: 65,
            rank: "#21"
        }
    })
})

export default router