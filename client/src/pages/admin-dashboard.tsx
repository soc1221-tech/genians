import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, Clock, UserCheck, Calendar, LogOut, ShieldQuestion, Search } from "lucide-react";
import { CalendarComponent } from "@/components/calendar";
import { EmployeeList } from "@/components/employee-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema, type InsertUser, type User, type LeaveRequest } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AdminStats = {
  totalEmployees: number;
  pendingRequests: number;
  onLeaveToday: number;
  thisMonth: number;
};

type LeaveRequestWithUser = LeaveRequest & { user: User };

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  if (user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/employees"],
  });

  const { data: allLeaveRequests = [] } = useQuery<LeaveRequestWithUser[]>({
    queryKey: ["/api/leave/all"],
  });

  const addEmployeeForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee" as const,
      totalLeave: 15,
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      addEmployeeForm.reset();
      toast({
        title: "Employee added",
        description: "New employee account created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add employee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddEmployee = (data: InsertUser) => {
    addEmployeeMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Generate calendar events for all employees
  const calendarEvents = allLeaveRequests.map(request => ({
    id: request.id,
    title: `${request.user.name} - ${request.reason}`,
    start: request.startDate,
    end: new Date(new Date(request.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    backgroundColor: getEventColor(request.user.name),
    borderColor: getEventColor(request.user.name),
  }));

  // Simple color generator based on name
  function getEventColor(name: string): string {
    const colors = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'];
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">LeaveFlow</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Admin
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700" data-testid="text-admin-name">{user.name}</span>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <ShieldQuestion className="h-4 w-4 text-gray-600" />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="text-total-employees">{stats?.totalEmployees || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-600" data-testid="text-pending-requests">{stats?.pendingRequests || 0}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Leave Today</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-on-leave-today">{stats?.onLeaveToday || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-purple-600" data-testid="text-this-month">{stats?.thisMonth || 0}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Employee Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add New Employee</CardTitle>
                <CardDescription>Create a new employee account</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...addEmployeeForm}>
                  <form onSubmit={addEmployeeForm.handleSubmit(onAddEmployee)} className="space-y-4">
                    <FormField
                      control={addEmployeeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Smith" 
                              data-testid="input-employee-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addEmployeeForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="john@company.com" 
                              data-testid="input-employee-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addEmployeeForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="••••••••" 
                              data-testid="input-employee-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addEmployeeForm.control}
                      name="totalLeave"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Leave Quota</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              max="50"
                              data-testid="input-leave-quota"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={addEmployeeMutation.isPending}
                      data-testid="button-add-employee"
                    >
                      {addEmployeeMutation.isPending ? "Adding Employee..." : "Add Employee"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Team Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Leave Calendar</CardTitle>
                <CardDescription>Overview of all team leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent events={calendarEvents} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Employee Management */}
        <div className="mt-8">
          <EmployeeList employees={employees} />
        </div>

        {/* All Leave Requests */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>All Leave Requests</CardTitle>
              <CardDescription>Overview of all employee leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {allLeaveRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leave requests yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date Range</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allLeaveRequests.map((request) => (
                        <tr key={request.id} data-testid={`row-all-leave-request-${request.id}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                   style={{ backgroundColor: getEventColor(request.user.name) }}>
                                {request.user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium text-gray-900">{request.user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {request.startDate === request.endDate 
                              ? new Date(request.startDate).toLocaleDateString()
                              : `${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}`
                            }
                          </td>
                          <td className="py-3 px-4 text-gray-900">{request.days}</td>
                          <td className="py-3 px-4 text-gray-600">{request.reason}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
