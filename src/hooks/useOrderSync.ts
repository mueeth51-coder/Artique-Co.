import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Order } from '@/lib/types';

export function useOrderSync(pollingInterval: number = 5000) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    if (!supabase) return;

    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });

      if (fetchError) {
        console.error('Error fetching orders:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        const ordersData = data.map((order: any) => ({
          id: order.id,
          createdAt: order.createdAt || new Date().toISOString(),
          customerName: order.customerName,
          address: order.address,
          phone: order.phone,
          notes: order.notes,
          items: Array.isArray(order.items) ? order.items : [],
          total: Number(order.total),
        }));
        setOrders(ordersData);
        setLastSync(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error syncing orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and set up polling
  useEffect(() => {
    // Fetch on mount
    fetchOrders();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchOrders();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchOrders, pollingInterval]);

  // Subscribe to real-time changes (if available in Supabase plan)
  useEffect(() => {
    if (!supabase) return;

    const subscription = supabase
      .channel('orders:*')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          // When any change occurs, refetch all orders
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    lastSync,
    error,
    refetch: fetchOrders,
  };
}
