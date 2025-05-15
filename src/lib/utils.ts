
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to calculate if vehicle is speeding (example threshold: 100 km/h)
export function isVehicleSpeeding(speed: number | null | undefined): boolean {
  if (!speed) return false;
  return speed > 100; // Assumes speed is in km/h
}

// Function to detect if vehicle has unusual acceleration/tilt
export function hasUnusualMovement(accelX: number | null | undefined, 
                                  accelY: number | null | undefined, 
                                  accelZ: number | null | undefined,
                                  pitch: number | null | undefined,
                                  roll: number | null | undefined): boolean {
  // Check for high acceleration in any direction (threshold values are examples)
  const highAcceleration = 
    (accelX !== null && accelX !== undefined && Math.abs(accelX) > 20) ||
    (accelY !== null && accelY !== undefined && Math.abs(accelY) > 20) ||
    (accelZ !== null && accelZ !== undefined && Math.abs(accelZ) > 30);
  
  // Check for unusual tilt
  const unusualTilt = 
    (pitch !== null && pitch !== undefined && Math.abs(pitch) > 45) ||
    (roll !== null && roll !== undefined && Math.abs(roll) > 45);
    
  return highAcceleration || unusualTilt;
}

// Format date utility
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}
