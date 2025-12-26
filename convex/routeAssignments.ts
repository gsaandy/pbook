import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get assignments for a specific date.
 */
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("routeAssignments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

/**
 * Get assignments for a specific date with employee and route details.
 */
export const getByDateWithDetails = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("routeAssignments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    // Fetch employee and route details for each assignment
    const detailed = await Promise.all(
      assignments.map(async (assignment) => {
        const employee = await ctx.db.get("employees", assignment.employeeId);
        const route = await ctx.db.get("routes", assignment.routeId);
        return {
          ...assignment,
          employee,
          route,
        };
      })
    );

    return detailed;
  },
});

/**
 * Get today's assignment for a specific employee.
 */
export const getEmployeeAssignment = query({
  args: {
    employeeId: v.id("employees"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("routeAssignments")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", args.date)
      )
      .first();
  },
});

/**
 * Assign a route to an employee for a specific date.
 */
export const assign = mutation({
  args: {
    employeeId: v.id("employees"),
    routeId: v.id("routes"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if employee already has an active assignment for this date
    const existing = await ctx.db
      .query("routeAssignments")
      .withIndex("by_employee_date", (q) =>
        q.eq("employeeId", args.employeeId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existing) {
      throw new Error("Employee already has an active assignment for this date");
    }

    const assignmentId = await ctx.db.insert("routeAssignments", {
      employeeId: args.employeeId,
      routeId: args.routeId,
      date: args.date,
      assignedAt: Date.now(),
      status: "active",
    });

    return assignmentId;
  },
});

/**
 * Cancel an assignment.
 */
export const cancel = mutation({
  args: { id: v.id("routeAssignments") },
  handler: async (ctx, args) => {
    await ctx.db.patch("routeAssignments", args.id, {
      status: "cancelled",
    });
    return args.id;
  },
});

/**
 * Mark an assignment as completed.
 */
export const complete = mutation({
  args: { id: v.id("routeAssignments") },
  handler: async (ctx, args) => {
    await ctx.db.patch("routeAssignments", args.id, {
      status: "completed",
    });
    return args.id;
  },
});
