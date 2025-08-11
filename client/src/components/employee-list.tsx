import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import type { User } from "@shared/schema";

interface EmployeeListProps {
  employees: User[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeStatus = (employee: User) => {
    // Simple logic - can be enhanced with actual leave status
    return employee.remainingLeave > 0 ? "Available" : "No Leave";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "No Leave":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getInitialsColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'];
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage employee accounts and leave balances</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-employees"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No employees found matching your search." : "No employees yet. Add your first employee above!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total Leave</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Used</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Remaining</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((employee) => {
                  const usedDays = employee.totalLeave - employee.remainingLeave;
                  const status = getEmployeeStatus(employee);
                  
                  return (
                    <tr key={employee.id} data-testid={`row-employee-${employee.id}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getInitialsColor(employee.name)}`}>
                            <span className="text-sm font-medium">{getInitials(employee.name)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-600">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{employee.totalLeave} days</td>
                      <td className="py-4 px-4 text-gray-900">{usedDays} days</td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${employee.remainingLeave > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {employee.remainingLeave} days
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            data-testid={`button-edit-employee-${employee.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid={`button-delete-employee-${employee.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
