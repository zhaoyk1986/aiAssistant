"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zhipuService_1 = require("../services/zhipuService");
const router = express_1.default.Router();
// Chat endpoint with streaming support
router.post('/stream', async (req, res) => {
    try {
        await (0, zhipuService_1.handleChatRequest)(req, res);
    }
    catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
