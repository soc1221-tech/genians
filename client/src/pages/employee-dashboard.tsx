import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Calendar, CheckCircle, Clock, LogOut, User, Settings } from "lucide-react";
import { LeaveRequestForm } from "@/components/leave-request-form";
import { CalendarComponent } from "@/components/calendar";
import { ChangePasswordForm } from "@/components/change-password-form";
import { LeaveList } from "@/components/leave-list";
import type { LeaveRequest, User as UserType } from "@shared/schema";

export default function EmployeeDashboard() {
  const { user, logoutMutation } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLeaveList, setShowLeaveList] = useState(false);

  if (user?.role === "admin") {
    return <Redirect to="/admin" />;
  }

  const { data: leaveRequests = [], isLoading: requestsLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave/mine"],
    enabled: !!user,
  });

  if (!user) return null;

  const usedDays = user.totalLeave - user.remainingLeave;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const calendarEvents = leaveRequests.map(request => ({
    id: request.id,
    title: request.reason,
    start: request.startDate,
    end: new Date(new Date(request.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Add 1 day for FullCalendar
    backgroundColor: request.status === 'approved' ? '#10B981' : request.status === 'pending' ? '#F59E0B' : '#EF4444',
    borderColor: request.status === 'approved' ? '#10B981' : request.status === 'pending' ? '#F59E0B' : '#EF4444',
  }));

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
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLeaveList(!showLeaveList);
                  setShowChangePassword(false);
                }}
                data-testid="button-my-leaves"
              >
                <Calendar className="h-4 w-4 mr-2" />
                My Leaves
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChangePassword(!showChangePassword);
                  setShowLeaveList(false);
                }}
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <span className="text-sm text-gray-700" data-testid="text-username">{user.name}</span>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Leave Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leave Days</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="text-total-leave">{user.totalLeave}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining Days</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-remaining-leave">{user.remainingLeave}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Used Days</p>
                  <p className="text-3xl font-bold text-orange-600" data-testid="text-used-leave">{usedDays}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leave Request Form / Settings / Leave List */}
          <div className="lg:col-span-1">
            {showChangePassword ? (
              <ChangePasswordForm />
            ) : showLeaveList ? (
              <LeaveList requests={leaveRequests} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Request Leave</CardTitle>
                  <CardDescription>Submit a new leave request</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaveRequestForm user={user} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Leave Schedule</CardTitle>
                <CardDescription>View your leave requests on the calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent events={calendarEvents} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leave History */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
              <CardDescription>Your leave request history</CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No leave requests yet. Submit your first request above!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date Range</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaveRequests.map((request) => (
                        <tr key={request.id} data-testid={`row-leave-request-${request.id}`}>
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
