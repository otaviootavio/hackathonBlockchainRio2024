import { createContext } from "react";
import { type PusherState } from "~/types/pusherTypes";

export const PusherContext = createContext<PusherState | null>(null);
