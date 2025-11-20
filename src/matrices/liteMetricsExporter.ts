import express, { Request, Response } from "express";
import si from "systeminformation";
import autoRefreshAccessToken from "../middlewares/auto-refresh";
import { authenticate } from "../middlewares/isAuthenticated";
import { requireRole } from "../middlewares/requireRole.middleware";

// 🧮 Node Load Metrics Helpers
async function getEventLoopLag(): Promise<number> {
    const start = performance.now();
    return new Promise((resolve) => {
        setImmediate(() => resolve(performance.now() - start));
    });
}

async function getNodeLoadMetrics() {
    const cpu = await si.currentLoad();
    const lag = await getEventLoopLag();

    const cpuScore = cpu.currentLoad / 100;      // normalize 0–1
    const lagScore = Math.min(lag / 200, 1);     // normalize 0–1
    const nodeLoadScore = Number(((cpuScore + lagScore) / 2).toFixed(2));

    return {
        node_event_loop_lag_ms: Number(lag.toFixed(2)),
        node_cpu_queue: cpu.avgLoad || 0, // Windows-friendly load metric
        node_load_score: nodeLoadScore,
    };
}

let totalRequests = 0;
let requestsLastMinute = 0;

// Reset every minute
setInterval(() => (requestsLastMinute = 0), 60000);

export interface MetricsData {
    timestamp: number;

    hostname: string;
    os: string;
    cpu_model: string;
    ram_total_gb: string;
    system_uptime_sec: number;

    cpu: string;
    cpu_temp: number;

    memory: string;
    memory_gb: string;

    disk: number;
    disk_free_gb: string;

    net_rx: string;
    net_tx: string;

    gpu_usage: number;
    gpu_temp: number;

    battery_percent: number;
    is_on_ac: boolean;

    load_1: number;
    load_5: number;

    node_event_loop_lag_ms: number;
    node_cpu_queue: number;
    node_load_score: number;

    top_processes: {
        name: string;
        cpu: string;
        mem: string;
    }[];

    total_requests: number;
    requests_last_minute: number;
}

async function getMetrics(): Promise<MetricsData> {
    const [
        cpuLoad,
        mem,
        disk,
        net,
        temp,
        gpu,
        battery,
        uptime,
        processes,
        osInfo,
        cpuInfo,
        nodeLoad,
    ] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.cpuTemperature(),
        si.graphics(),
        si.battery(),
        si.time(),
        si.processes(),
        si.osInfo(),
        si.cpu(),
        getNodeLoadMetrics(),     
    ]);

    const load: number[] = (uptime as any).load ?? [0, 0, 0];

    const acStatus =
        (battery as any).ac ??
        (battery as any).ischarging ??
        battery.isCharging ??
        false;

    const topProcesses = processes.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 3)
        .map((p) => ({
            name: p.name,
            cpu: p.cpu.toFixed(1),
            mem: p.mem.toFixed(1),
        }));

    return {
        timestamp: Date.now(),

        hostname: osInfo.hostname,
        os: `${osInfo.distro} ${osInfo.release}`,
        cpu_model: `${cpuInfo.manufacturer} ${cpuInfo.brand}`,
        ram_total_gb: (mem.total / 1024 / 1024 / 1024).toFixed(2),
        system_uptime_sec: uptime.uptime,

        cpu: cpuLoad.currentLoad.toFixed(1),
        cpu_temp: temp.main ?? 0,

        memory: ((mem.active / mem.total) * 100).toFixed(1),
        memory_gb: (mem.active / 1024 / 1024 / 1024).toFixed(2),

        disk: disk[0]?.use ?? 0,
        disk_free_gb: (disk[0]?.available / 1024 / 1024 / 1024).toFixed(1),

        net_rx: (net[0]?.rx_sec / 1024).toFixed(1),
        net_tx: (net[0]?.tx_sec / 1024).toFixed(1),

        gpu_usage: gpu.controllers?.[0]?.utilizationGpu ?? 0,
        gpu_temp: gpu.controllers?.[0]?.temperatureGpu ?? 0,

        battery_percent: battery.percent ?? 0,
        is_on_ac: acStatus,

        load_1: load[0],
        load_5: load[1],

        // ⭐ NEW Node.js system load metrics
        node_event_loop_lag_ms: nodeLoad.node_event_loop_lag_ms,
        node_cpu_queue: nodeLoad.node_cpu_queue,
        node_load_score: nodeLoad.node_load_score,

        top_processes: topProcesses,

        total_requests: totalRequests,
        requests_last_minute: requestsLastMinute,
    };
}

const liteMetricsRouter = express.Router();

liteMetricsRouter.get(
    "/admin/sys-metrics",
    autoRefreshAccessToken,
    authenticate,
    requireRole(["admin"]),
    async (_req: Request, res: Response) => {
        totalRequests++;
        requestsLastMinute++;

        const metrics = await getMetrics();
        res.json(metrics);
    }
);

export default liteMetricsRouter;
