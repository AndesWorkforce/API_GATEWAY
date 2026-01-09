import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';

/**
 * DTO para generar reportes de productividad
 */
export class GenerateReportDto {
  /**
   * Fecha de inicio del período (ISO 8601)
   * @example "2025-01-01"
   */
  @IsDateString()
  from: string;

  /**
   * Fecha de fin del período (ISO 8601)
   * @example "2025-01-31"
   */
  @IsDateString()
  to: string;

  /**
   * ID del equipo (opcional)
   */
  @IsOptional()
  @IsString()
  team_id?: string;

  /**
   * ID del cliente (opcional)
   */
  @IsOptional()
  @IsString()
  client_id?: string;

  /**
   * ID del contractor específico (opcional)
   */
  @IsOptional()
  @IsString()
  contractor_id?: string;

  /**
   * Campos a mostrar en el reporte (opcional, por defecto todos)
   * Campos disponibles:
   * - contractorName (requerido)
   * - jobPosition
   * - clientName
   * - teamName
   * - country
   * - timeWorked (requerido)
   * - activityPercentage
   * - productivityScore
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedFields?: string[];
}
