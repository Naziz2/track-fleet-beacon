
import { useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { detectAlerts, createAlert } from "@/utils/alertDetection";
import { toast } from "sonner";

/**
 * Silent component that processes vehicle position data in real-time
 * to detect and create alerts
 */
export const AlertProcessor = () => {
  useEffect(() => {
    // Subscribe to vehicle position updates
    const channel = supabase
      .channel('vehicle-positions-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'vehicle_positions' 
        },
        async (payload) => {
          try {
            const positionData = payload.new;
            
            // Get the vehicle ID for this device
            const { data: deviceData } = await supabase
              .from('devices')
              .select('vehicle_id')
              .eq('id', positionData.device_id)
              .single();
              
            if (deviceData && deviceData.vehicle_id) {
              // Process the vehicle data for alerts
              const alert = await detectAlerts(deviceData.vehicle_id, positionData);
              
              if (alert) {
                await createAlert(alert);
                
                // Show a toast notification of the new alert (only for admin and developer views)
                toast.error(`New Alert: ${alert.type}`, {
                  description: alert.description,
                });
              }
            }
          } catch (error) {
            console.error("Error processing position data for alerts:", error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default AlertProcessor;
