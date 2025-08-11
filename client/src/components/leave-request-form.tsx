import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { insertLeaveRequestSchema, type InsertLeaveRequest, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";

interface LeaveRequestFormProps {
  user: User;
}

export function LeaveRequestForm({ user }: LeaveRequestFormProps) {
  const { toast } = useToast();
  const [calculatedDays, setCalculatedDays] = useState(0);

  const form = useForm<InsertLeaveRequest>({
    resolver: zodResolver(insertLeaveRequestSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
      days: 0,
      userId: user.id,
    },
  });

  const leaveRequestMutation = useMutation({
    mutationFn: async (data: InsertLeaveRequest) => {
      const res = await apiRequest("POST", "/api/leave/request", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave/mine"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      setCalculatedDays(0);
      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  // Update calculated days when dates change
  useEffect(() => {
    const days = calculateDays(startDate, endDate);
    setCalculatedDays(days);
    form.setValue("days", days);
  }, [startDate, endDate, form]);

  const onSubmit = (data: InsertLeaveRequest) => {
    if (calculatedDays > user.remainingLeave) {
      toast({
        title: "Insufficient leave balance",
        description: `You have ${user.remainingLeave} days remaining, but requested ${calculatedDays} days.`,
        variant: "destructive",
      });
      return;
    }

    leaveRequestMutation.mutate(data);
  };

  const remainingAfterRequest = user.remainingLeave - calculatedDays;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  data-testid="input-start-date"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  data-testid="input-end-date"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please provide a reason for your leave request..."
                  className="resize-none"
                  rows={3}
                  data-testid="input-reason"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {calculatedDays > 0 && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <div>
                <p className="font-medium">
                  Days to be deducted: <span data-testid="text-calculated-days">{calculatedDays}</span>
                </p>
                <p>
                  Remaining after request: <span 
                    className={remainingAfterRequest < 0 ? "text-red-600 font-medium" : ""}
                    data-testid="text-remaining-after-request"
                  >
                    {remainingAfterRequest}
                  </span>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={leaveRequestMutation.isPending || calculatedDays === 0 || remainingAfterRequest < 0}
          data-testid="button-submit-request"
        >
          {leaveRequestMutation.isPending ? "Submitting Request..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
}
