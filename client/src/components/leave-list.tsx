import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Calendar, Clock } from "lucide-react";
import { EditLeaveForm } from "./edit-leave-form";
import type { LeaveRequest } from "@shared/schema";

interface LeaveListProps {
  requests: LeaveRequest[];
}

export function LeaveList({ requests }: LeaveListProps) {
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (editingRequest) {
    return (
      <EditLeaveForm 
        request={editingRequest} 
        onClose={() => setEditingRequest(null)} 
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave Requests</CardTitle>
        <CardDescription>View and manage your leave history</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No leave requests found</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div 
                key={request.id}
                className="p-4 border rounded-lg hover:bg-gray-50"
                data-testid={`leave-request-${request.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium" data-testid={`text-dates-${request.id}`}>
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </span>
                      <Badge 
                        className={getStatusColor(request.status)}
                        data-testid={`badge-status-${request.id}`}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600" data-testid={`text-days-${request.id}`}>
                        {request.days} {request.days === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700" data-testid={`text-reason-${request.id}`}>
                      {request.reason}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRequest(request)}
                    data-testid={`button-edit-${request.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}