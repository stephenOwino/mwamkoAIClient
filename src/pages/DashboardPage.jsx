// src/pages/DashboardPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllRoutes } from '../slices/routeSlice';
import { getVehicles } from '../slices/vehicleSlice';
import { getEmergencyCases } from '../slices/emergencyCaseSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  
  const { cases = [] } = useSelector((state) => state.emergencyCase);
  const { routes = [] } = useSelector((state) => state.route);
  const { vehicles = [] } = useSelector((state) => state.vehicle);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEmergencyCases());
    dispatch(getAllRoutes());
    dispatch(getVehicles());
  }, [dispatch]);

  // Helper function to safely get values and filter out unknown/empty
  const safeValue = (value, fallback = null) => {
    if (!value || value === 'Unknown' || value === 'UNKNOWN') return fallback;
    return value;
  };

  // Filter out cases with missing critical data
  const validCases = cases.filter(c => 
    safeValue(c.emergency_type) && 
    safeValue(c.case_status) && 
    safeValue(c.priority_level)
  );

  const stats = {
    totalEmergencies: validCases.length,
    activeEmergencies: validCases.filter(c => (c.case_status || '').match(/OPEN|IN_PROGRESS/)).length,
    highPriority: validCases.filter(c => (c.priority_level || '').match(/HIGH|CRITICAL/)).length,
    resolvedToday: validCases.filter(c => c.case_status === 'RESOLVED').length,
    
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.current_status === 'AVAILABLE').length,
    onMission: vehicles.filter(v => v.current_status === 'ON_MISSION').length,
    inMaintenance: vehicles.filter(v => v.current_status === 'MAINTENANCE').length,
    
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status && r.status !== 'COMPLETED').length,
  };

  // Get emergency types (excluding Unknown)
  const emergencyTypes = [...new Set(
    validCases
      .map(c => safeValue(c.emergency_type))
      .filter(Boolean)
  )];
  
  const emergencyDistribution = emergencyTypes
    .map(type => ({
      type,
      count: validCases.filter(c => c.emergency_type === type).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Get recent activities (only valid ones)
  const recentActivities = validCases
    .filter(c => c.created_at) // Must have timestamp
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
    .map(c => ({
      id: c.case_id,
      title: c.emergency_type,
      priority: c.priority_level,
      status: c.case_status,
      time: new Date(c.created_at).toLocaleString(),
    }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-yellow-50 p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-lg opacity-90">Welcome back, {user?.full_name || 'User'}!</p>
              <p className="text-sm opacity-70 mt-1">Real-time emergency response coordination</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-70">Last updated</p>
              <p className="text-lg font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Data Quality Alert */}
        {cases.length > validCases.length && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800">
                <span className="font-medium">{cases.length - validCases.length} incomplete emergency case(s)</span> hidden from dashboard. Please ensure all cases have emergency type, status, and priority assigned.
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Active Emergencies */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.activeEmergencies}</p>
                <p className="text-sm opacity-90">Active</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Emergency Cases</h3>
            <p className="text-sm opacity-90">{stats.totalEmergencies} total cases</p>
          </div>

          {/* High Priority */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.highPriority}</p>
                <p className="text-sm opacity-90">Critical</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">High Priority</h3>
            <p className="text-sm opacity-90">Requires immediate attention</p>
          </div>

          {/* Available Vehicles */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.availableVehicles}</p>
                <p className="text-sm opacity-90">Available</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Fleet Vehicles</h3>
            <p className="text-sm opacity-90">{stats.totalVehicles} total vehicles</p>
          </div>

          {/* Active Routes */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.activeRoutes}</p>
                <p className="text-sm opacity-90">Active</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">Calculated Routes</h3>
            <p className="text-sm opacity-90">{stats.totalRoutes} total routes</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg">
            <div className="bg-black text-yellow-50 p-4 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Emergency Activities
              </h2>
            </div>

            <div className="divide-y">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">No recent activities</p>
                  <p className="text-sm mt-1">Emergency cases will appear here once created</p>
                </div>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🚨</span>
                          <div>
                            <h4 className="font-bold text-gray-800">{activity.title}</h4>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-11">
                          {/* Priority Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            activity.priority.match(/CRITICAL|HIGH/)
                              ? 'bg-red-100 text-red-800'
                              : activity.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.priority}
                          </span>

                          {/* Status Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            activity.status === 'OPEN'
                              ? 'bg-blue-100 text-blue-800'
                              : activity.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT SIDE PANELS */}
          <div className="space-y-6">
            {/* Emergency Types */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="bg-black text-yellow-50 p-4 rounded-t-lg">
                <h2 className="text-xl font-bold">Emergency Types</h2>
              </div>

              <div className="p-4 space-y-3">
                {emergencyDistribution.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm font-medium">No emergency data</p>
                    <p className="text-xs mt-1">Types will appear once cases are created</p>
                  </div>
                ) : (
                  emergencyDistribution.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.type}</span>
                        <span className="text-sm font-bold text-red-500">{item.count}</span>
                      </div>

                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-400 to-red-600 h-full transition-all duration-500"
                          style={{
                            width: `${
                              stats.totalEmergencies > 0
                                ? ((item.count / stats.totalEmergencies) * 100).toFixed(0)
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vehicle Status */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="bg-black text-yellow-50 p-4 rounded-t-lg">
                <h2 className="text-xl font-bold">Vehicle Fleet Status</h2>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats.availableVehicles}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">On Mission</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{stats.onMission}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Maintenance</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">{stats.inMaintenance}</span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Fleet Efficiency</span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats.totalVehicles > 0
                        ? ((stats.availableVehicles / stats.totalVehicles) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-lg font-bold text-green-600">Operational</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.totalEmergencies > 0
                    ? ((stats.resolvedToday / stats.totalEmergencies) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Routes</p>
                <p className="text-lg font-bold text-purple-600">{stats.activeRoutes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;