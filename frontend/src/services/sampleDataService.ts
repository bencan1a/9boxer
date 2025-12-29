/**
 * Sample data generation service
 *
 * Provides methods for generating sample employee datasets for testing
 * and demonstration purposes.
 */

import { apiClient } from "./api";
import { Employee } from "../types/employee";

export interface GenerateSampleRequest {
  size: number;
  include_bias: boolean;
  seed?: number;
}

export interface GenerateSampleResponse {
  employees: Employee[];
  metadata: {
    total: number;
    bias_patterns?: string[];
    locations: string[];
    functions: string[];
  };
  session_id: string;
  filename: string;
}

/**
 * Sample data service for interacting with sample data generation API
 */
export const sampleDataService = {
  /**
   * Generate a sample dataset with specified parameters
   *
   * @param request - Configuration for sample data generation
   * @returns Generated employees and metadata
   * @throws ApiError if generation fails
   */
  async generateSampleDataset(
    request: GenerateSampleRequest
  ): Promise<GenerateSampleResponse> {
    const response = await apiClient.generateSampleData(
      request.size,
      request.include_bias,
      request.seed
    );
    return response;
  },

  /**
   * Load default sample data (200 employees with bias patterns)
   * Convenience method for quick testing
   *
   * @returns Array of generated employees
   * @throws ApiError if generation fails
   */
  async loadDefaultSampleData(): Promise<Employee[]> {
    const response = await this.generateSampleDataset({
      size: 200,
      include_bias: true,
    });
    return response.employees;
  },
};
