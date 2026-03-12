import express from "express"

const router = express.Router()

router.get("/", async (req, res) => {
    res.json({
        posts: [],
        trending: [],
        connections: [],
        status: {
            networkValue: "$0",
            progress: 50,
            rank: "—"
        }
    })
})

export default router