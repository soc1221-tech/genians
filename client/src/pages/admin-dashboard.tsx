import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, UserCheck, Calendar, LogOut, ShieldQuestion, UserPlus } from "lucide-react";
import { CalendarComponent } from "@/components/calendar";
import { EmployeeList } from "@/components/employee-list";
import { type User, type LeaveRequest } from "@shared/schema";

type AdminStats = {
  totalEmployees: number;
  onLeaveToday: number;
  thisMonth: number;
};

type LeaveRequestWithUser = LeaveRequest & { user: User };

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();

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
              <Link href="/admin/add-employee">
                <Button variant="outline" size="sm" data-testid="button-add-employee-nav">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Team Calendar */}
        <div className="mb-8">
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
