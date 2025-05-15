
import { supabase } from "@/lib/supabase";
import { isVehicleSpeeding, hasUnusualMovement } from "@/lib/utils";

// Generate an alert based on vehicle position data
export async function generateAlertFromPosition(positionData: any, deviceId: string) {
  try {
    // Get vehicle associated with this device
    const { data: deviceData, error: deviceError } = await supabase
      .from('devices')
      .select('vehicle_id')
      .eq('id', deviceId)
      .single();
    
    if (deviceError || !deviceData) {
      console.error("Error finding vehicle for device:", deviceError);
      return null;
    }
    
    const vehicleId = deviceData.vehicle_id;
    let alertType = null;
    let alertDescription = "";
    
    // Check for speeding
    if (isVehicleSpeeding(positionData.speed)) {
      alertType = "critical";
      alertDescription = `Vehicle is speeding at ${positionData.speed} km/h`;
    }
    // Check for unusual movement
    else if (hasUnusualMovement(
      positionData.accel_x, 
      positionData.accel_y, 
      positionData.accel_z,
      positionData.pitch,
      positionData.roll
    )) {
      alertType = "warning";
      alertDescription = "Vehicle has unusual movement pattern - possible accident or rough driving";
    }
    
    // If an alert condition was triggered
    if (alertType && alertDescription) {
      // Create the alert in the database
      const { data: alertData, error: alertError } = await supabase
        .from('alerts')
        .insert({
          vehicle_id: vehicleId,
          type: alertType,
          description: alertDescription
        })
        .select();
        
      if (alertError) {
        console.error("Error creating alert:", alertError);
      }
      
      return alertData?.[0] || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error in generateAlertFromPosition:", error);
    return null;
  }
}

// Fetch recent positions and generate alerts if needed
export async function processRecentPositions() {
  try {
    // Get recent positions that haven't been processed for alerts
    const { data: positionsData, error: positionsError } = await supabase
      .from('vehicle_positions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (positionsError || !positionsData) {
      console.error("Error fetching positions:", positionsError);
      return [];
    }
    
    const alerts = [];
    
    // Process each position for alerts
    for (const position of positionsData) {
      const alert = await generateAlertFromPosition(position, position.device_id);
      if (alert) {
        alerts.push(alert);
      }
    }
    
    return alerts;
  } catch (error) {
    console.error("Error processing recent positions:", error);
    return [];
  }
}
