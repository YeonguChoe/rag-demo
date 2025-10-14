import type { Route } from "./+types/home";
import { Chatbot } from "../chatbot/chatbot";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chatbot" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Chatbot />;
}
