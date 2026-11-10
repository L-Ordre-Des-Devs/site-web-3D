import { createContext, useContext, type MutableRefObject } from "react";
import type { Experience } from "./experience";

export const ExperienceContext = createContext<MutableRefObject<Experience | null>>({ current: null });

export const useExperience = () => useContext(ExperienceContext);
