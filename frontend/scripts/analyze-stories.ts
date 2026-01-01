/**
 * Comprehensive story analysis script
 *
 * Identifies:
 * - Incomplete stories (minimal args, no decorators, placeholder content)
 * - Experimental stories (zoom, variants, testing features)
 * - Stories needing decisions (keep vs. remove)
 *
 * Usage: tsx scripts/analyze-stories.ts
 */

import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

interface StoryAnalysis {
  file: string;
  title: string;
  storyName: string;
  issues: string[];
  category: "incomplete" | "experimental" | "production";
  recommendation: string;
}

const EXPERIMENTAL_PATTERNS = [
  /🔍/,
  /🔬/,
  /ZoomLevels/i,
  /OriginalPosition/i,
  /Experimental/i,
  /_Interactive$/,
  /_Comparison$/,
  /_DensityTest$/,
  /_TokenMatrix$/,
  /_AllVariants$/,
];

function extractStories(
  content: string,
  filePath: string,
  title: string
): StoryAnalysis[] {
  const analyses: StoryAnalysis[] = [];

  // Find all story exports
  const storyMatches = content.matchAll(
    /export const (\w+): Story = \{([^}]*(?:\{[^}]*\})*[^}]*)\}/gs
  );

  for (const match of storyMatches) {
    const storyName = match[1];
    const storyContent = match[2];
    const issues: string[] = [];
    let category: "incomplete" | "experimental" | "production" = "production";

    // Check for experimental patterns
    const isExperimental = EXPERIMENTAL_PATTERNS.some(
      (pattern) => pattern.test(storyName) || pattern.test(storyContent)
    );

    if (isExperimental) {
      category = "experimental";
      issues.push("Marked as experimental (zoom/variant testing)");
    }

    // Check for incomplete indicators
    const hasArgs = storyContent.includes("args:");
    const hasDecorators = storyContent.includes("decorators:");
    const hasParameters = storyContent.includes("parameters:");
    const hasPlay = storyContent.includes("play:");

    // Minimal story detection
    const argCount = (storyContent.match(/\w+:/g) || []).length;
    if (argCount < 2 && !hasDecorators && !hasPlay) {
      category = "incomplete";
      issues.push("Minimal implementation (few args, no decorators/play)");
    }

    // Check for placeholder comments
    if (storyContent.includes("TODO") || storyContent.includes("FIXME")) {
      category = "incomplete";
      issues.push("Contains TODO/FIXME comments");
    }

    // Empty args
    if (hasArgs && storyContent.match(/args:\s*\{\s*\}/)) {
      category = "incomplete";
      issues.push("Empty args object");
    }

    // No story-level documentation
    const storyDocMatch = content.match(
      new RegExp(`/\\*\\*[^*]*\\*/\\s*export const ${storyName}`, "s")
    );
    if (!storyDocMatch && category !== "experimental") {
      issues.push("Missing JSDoc documentation");
    }

    // Determine recommendation
    let recommendation = "Keep as-is";
    if (category === "incomplete") {
      recommendation = "Complete implementation or remove";
    } else if (category === "experimental") {
      recommendation =
        "Review: Keep if feature is production-ready, archive otherwise";
    }

    if (issues.length > 0) {
      analyses.push({
        file: path.relative(process.cwd(), filePath),
        title,
        storyName,
        issues,
        category,
        recommendation,
      });
    }
  }

  return analyses;
}

async function main() {
  console.log("🔍 Analyzing Storybook stories for issues...\n");

  const storyFiles = await glob("src/**/*.stories.tsx", {
    cwd: process.cwd(),
    absolute: true,
  });

  const allAnalyses: StoryAnalysis[] = [];

  for (const filePath of storyFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : "Unknown";

    const analyses = extractStories(content, filePath, title);
    allAnalyses.push(...analyses);
  }

  // Group by category
  const incomplete = allAnalyses.filter((a) => a.category === "incomplete");
  const experimental = allAnalyses.filter((a) => a.category === "experimental");

  // Print report
  console.log("=".repeat(80));
  console.log("📊 STORY ANALYSIS REPORT");
  console.log("=".repeat(80));
  console.log(`Total issues found: ${allAnalyses.length}\n`);

  if (incomplete.length > 0) {
    console.log("🚧 INCOMPLETE STORIES (" + incomplete.length + ")");
    console.log("─".repeat(80));

    const byFile = new Map<string, StoryAnalysis[]>();
    for (const analysis of incomplete) {
      if (!byFile.has(analysis.file)) {
        byFile.set(analysis.file, []);
      }
      byFile.get(analysis.file)!.push(analysis);
    }

    for (const [file, stories] of byFile.entries()) {
      console.log(`\n📄 ${file}`);
      for (const story of stories) {
        console.log(`   ⚠️  ${story.title} → ${story.storyName}`);
        for (const issue of story.issues) {
          console.log(`      - ${issue}`);
        }
        console.log(`      💡 ${story.recommendation}`);
      }
    }
    console.log("\n");
  }

  if (experimental.length > 0) {
    console.log("🔬 EXPERIMENTAL STORIES (" + experimental.length + ")");
    console.log("─".repeat(80));

    const byFile = new Map<string, StoryAnalysis[]>();
    for (const analysis of experimental) {
      if (!byFile.has(analysis.file)) {
        byFile.set(analysis.file, []);
      }
      byFile.get(analysis.file)!.push(analysis);
    }

    for (const [file, stories] of byFile.entries()) {
      console.log(`\n📄 ${file}`);
      for (const story of stories) {
        console.log(`   🔍 ${story.title} → ${story.storyName}`);
        for (const issue of story.issues) {
          console.log(`      - ${issue}`);
        }
        console.log(`      💡 ${story.recommendation}`);
      }
    }
    console.log("\n");
  }

  console.log("=".repeat(80));
  console.log("📋 SUMMARY");
  console.log("=".repeat(80));
  console.log(`🚧 Incomplete stories: ${incomplete.length}`);
  console.log(`🔬 Experimental stories: ${experimental.length}`);
  console.log(`✨ Total stories analyzed: ${storyFiles.length} files`);
  console.log("=".repeat(80));

  // Write detailed report to file
  const reportPath = path.join(process.cwd(), "story-analysis-report.md");
  let report = "# Storybook Story Analysis Report\n\n";
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Incomplete stories**: ${incomplete.length}\n`;
  report += `- **Experimental stories**: ${experimental.length}\n`;
  report += `- **Total files analyzed**: ${storyFiles.length}\n\n`;

  if (incomplete.length > 0) {
    report += `## 🚧 Incomplete Stories\n\n`;
    report += `These stories need to be completed or removed:\n\n`;

    const byFile = new Map<string, StoryAnalysis[]>();
    for (const analysis of incomplete) {
      if (!byFile.has(analysis.file)) {
        byFile.set(analysis.file, []);
      }
      byFile.get(analysis.file)!.push(analysis);
    }

    for (const [file, stories] of byFile.entries()) {
      report += `### ${file}\n\n`;
      for (const story of stories) {
        report += `#### ${story.storyName}\n\n`;
        report += `**Story**: \`${story.title} → ${story.storyName}\`\n\n`;
        report += `**Issues**:\n`;
        for (const issue of story.issues) {
          report += `- ${issue}\n`;
        }
        report += `\n**Recommendation**: ${story.recommendation}\n\n`;
      }
    }
  }

  if (experimental.length > 0) {
    report += `## 🔬 Experimental Stories\n\n`;
    report += `These stories are testing experimental features:\n\n`;

    const byFile = new Map<string, StoryAnalysis[]>();
    for (const analysis of experimental) {
      if (!byFile.has(analysis.file)) {
        byFile.set(analysis.file, []);
      }
      byFile.get(analysis.file)!.push(analysis);
    }

    for (const [file, stories] of byFile.entries()) {
      report += `### ${file}\n\n`;
      for (const story of stories) {
        report += `#### ${story.storyName}\n\n`;
        report += `**Story**: \`${story.title} → ${story.storyName}\`\n\n`;
        report += `**Notes**:\n`;
        for (const issue of story.issues) {
          report += `- ${issue}\n`;
        }
        report += `\n**Recommendation**: ${story.recommendation}\n\n`;
      }
    }
  }

  fs.writeFileSync(reportPath, report, "utf-8");
  console.log(`\n✅ Detailed report written to: story-analysis-report.md\n`);
}

main();
