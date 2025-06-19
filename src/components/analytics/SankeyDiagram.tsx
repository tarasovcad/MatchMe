"use client";
import React from "react";
import {ResponsiveSankey} from "@nivo/sankey";
import {motion} from "motion/react";

// Generate fake data for the conversion funnel
const generateFakeData = () => {
  const nodes = [
    // Initial stage
    {id: "Profile Viewed", color: "#7e72ee"},

    // First interaction stage
    {id: "Follow Clicked", color: "#9F95FF"},
    {id: "Message Sent", color: "#BDB4FF"},
    {id: "Direct Invite", color: "#D0C9FF"},

    // Second interaction stage
    {id: "Follow → Invite", color: "#E2DDFF"},
    {id: "Message → Invite", color: "#aba1ff"},
    {id: "Follow → Message", color: "#8A80FF"},

    // Final outcomes
    {id: "Collaboration", color: "#6B5FE8"},

    // Drop-off points
    {id: "Initial Drop-off", color: "#E5E5E5"},
    {id: "Follow Drop-off", color: "#A8A8A8"},
    {id: "Message Drop-off", color: "#A8A8A8"},
    {id: "Final Drop-off", color: "#C0C0C0"},
  ];

  const links = [
    // Direct paths from Profile Viewed
    {source: "Profile Viewed", target: "Follow Clicked", value: 450},
    {source: "Profile Viewed", target: "Message Sent", value: 320},
    {source: "Profile Viewed", target: "Direct Invite", value: 180},
    {source: "Profile Viewed", target: "Initial Drop-off", value: 50},

    // Multi-step paths
    {source: "Follow Clicked", target: "Follow → Invite", value: 220},
    {source: "Follow Clicked", target: "Follow → Message", value: 150},
    {source: "Follow Clicked", target: "Follow Drop-off", value: 80},

    {source: "Message Sent", target: "Message → Invite", value: 180},
    {source: "Message Sent", target: "Message Drop-off", value: 140},

    {source: "Direct Invite", target: "Collaboration", value: 120},

    // Final conversions to collaboration
    {source: "Follow → Invite", target: "Collaboration", value: 180},
    {source: "Follow → Invite", target: "Final Drop-off", value: 40},

    {source: "Message → Invite", target: "Collaboration", value: 140},
    {source: "Message → Invite", target: "Final Drop-off", value: 40},

    {source: "Follow → Message", target: "Collaboration", value: 90},
    {source: "Follow → Message", target: "Final Drop-off", value: 60},
  ];

  return {nodes, links};
};

const SankeyDiagram = () => {
  const data = generateFakeData();
  return (
    <motion.div
      className="w-full h-[500px] mt-2"
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.6, ease: "easeOut"}}>
      {/* Drop-off Analysis Summary */}

      <div className="flex items-center gap-4 text-xs w-full justify-end">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{backgroundColor: "#6B5FE8"}} />
          <span className="text-muted-foreground">Success</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{backgroundColor: "#A8A8A8"}} />
          <span className="text-muted-foreground">Drop-off</span>
        </div>
      </div>

      <ResponsiveSankey
        data={data}
        margin={{top: 20, right: 100, bottom: 30, left: 100}}
        align="justify"
        colors={[
          "#7e72ee", // Profile Viewed - deep purple
          "#9F95FF", // Follow Clicked - purple
          "#BDB4FF", // Message Sent - light purple
          "#D0C9FF", // Direct Invite - lighter purple
          "#E2DDFF", // Follow → Invite - very light purple
          "#aba1ff", // Message → Invite - alternative purple
          "#8A80FF", // Follow → Message - medium purple
          "#6B5FE8", // Collaboration - final success strong purple
          "#E5E5E5", // Initial Drop-off - light gray
          "#A8A8A8", // Follow Drop-off - medium gray
          "#A8A8A8", // Message Drop-off - medium gray
          "#C0C0C0", // Final Drop-off - neutral gray
        ]}
        nodeOpacity={0.9}
        nodeHoverOpacity={1}
        nodeThickness={24}
        nodeSpacing={16}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: "color",
          modifiers: [["darker", 0.8]],
        }}
        nodeBorderRadius={4}
        linkOpacity={0.3}
        linkHoverOpacity={0.6}
        linkContract={2}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor="hsl(var(--foreground))"
        animate={true}
        motionConfig="gentle"
        nodeTooltip={({node}) => (
          <div className="border border-border/50 bg-background grid min-w-max whitespace-nowrap items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
            <div className="gap-1.5 grid">
              <div className="flex w-full flex-wrap gap-2 items-center [&>svg]:text-muted-foreground [&>svg]:h-2.5 [&>svg]:w-2.5">
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="font-medium text-foreground">{node.label || node.id}</span>
                  <div className="flex justify-between items-center gap-2 leading-none">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="rounded-full w-2 h-2"
                        style={{backgroundColor: node.color}}></div>
                      <div className="gap-1.5 grid">
                        <span className="text-muted-foreground">Users</span>
                      </div>
                    </div>
                    <span className="font-medium tabular-nums text-foreground">
                      {node.value?.toLocaleString()}
                    </span>
                  </div>

                  {(node.label || node.id).includes("Drop-off") && (
                    <div className="text-[#FF3C4E] font-medium">
                      ⚠️ Conversion lost at this stage
                    </div>
                  )}
                  {(node.label || node.id) === "Collaboration" && (
                    <div className="text-[#009E61] font-medium">✅ Successful conversion</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        linkTooltip={({link}) => (
          <div className="border border-border/50 bg-background grid min-w-max whitespace-nowrap items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
            <div className="gap-1.5 grid">
              <div className="flex w-full flex-wrap gap-2 items-start">
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="font-medium text-foreground">
                    {link.source.label || link.source.id} → {link.target.label || link.target.id}
                  </span>

                  <div className="flex justify-between items-center gap-2 leading-none">
                    <span className="text-muted-foreground">Users</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {link.value?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2 leading-none">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {((link.value / 1000) * 100).toFixed(1)}%
                    </span>
                  </div>

                  {(link.target.label || link.target.id).includes("Drop-off") && (
                    <div className="text-[#FF3C4E] text-xs">🔻 Users lost here</div>
                  )}
                  {(link.target.label || link.target.id) === "Collaboration" && (
                    <div className="text-[#009E61] text-xs">📈 Conversion success</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        theme={{
          background: "transparent",
          text: {
            fontSize: 12,
            fill: "hsl(var(--foreground))",
            fontWeight: 500,
            fontFamily: "inherit",
          },
          axis: {
            domain: {
              line: {
                stroke: "hsl(var(--border))",
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 14,
                fill: "hsl(var(--foreground))",
                fontWeight: 500,
              },
            },
            ticks: {
              line: {
                stroke: "hsl(var(--border))",
                strokeWidth: 1,
              },
              text: {
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
                fontWeight: 400,
              },
            },
          },
          grid: {
            line: {
              stroke: "hsl(var(--border))",
              strokeWidth: 1,
            },
          },
          legends: {
            title: {
              text: {
                fontSize: 14,
                fill: "hsl(var(--foreground))",
                fontWeight: 500,
              },
            },
            text: {
              fontSize: 14,
              fill: "hsl(var(--foreground))",
              fontWeight: 500,
            },
            ticks: {
              line: {},
              text: {
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
                fontWeight: 400,
              },
            },
          },
          tooltip: {
            container: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              fontSize: 12,
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              border: "1px solid hsl(var(--border))",
            },
          },
        }}
      />
    </motion.div>
  );
};

export default SankeyDiagram;
