import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiscordProvider } from "./DiscordProvider";
import { TelegramProvider } from "./TelegramProvider";

describe("DiscordProvider", () => {
    it("should store channelId after sending a message", async () => {
        const provider = new DiscordProvider({
            enabled: true,
            botToken: process.env.DISCORD_BOT_TOKEN!,
            userId: process.env.DISCORD_USER_ID!,
        });
        await provider.sendMessage({ title: "Prolific", body: "Test message" });
        expect(provider.configData.channelId).toBeDefined();
    });
});

describe("TelegramProvider", () => {
    it("should store chatId after sending a message", async () => {
        const provider = new TelegramProvider({
            enabled: true,
            botToken: process.env.TELEGRAM_BOT_TOKEN!,
        });
        await provider.sendMessage({ title: "Prolific", body: "Test message" });
        expect(provider.configData.chatId).toBeDefined();
    });
});
