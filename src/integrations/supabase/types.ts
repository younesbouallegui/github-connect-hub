export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      asset_dependencies: {
        Row: {
          created_at: string
          dependency_type: Database["public"]["Enums"]["dependency_type"]
          id: string
          source_asset_id: string
          target_asset_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: Database["public"]["Enums"]["dependency_type"]
          id?: string
          source_asset_id: string
          target_asset_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: Database["public"]["Enums"]["dependency_type"]
          id?: string
          source_asset_id?: string
          target_asset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_dependencies_source_asset_id_fkey"
            columns: ["source_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_dependencies_target_asset_id_fkey"
            columns: ["target_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string
          criticality: Database["public"]["Enums"]["criticality"]
          department_id: string | null
          environment: Database["public"]["Enums"]["environment"]
          hostname: string | null
          id: string
          ip_address: string | null
          location: string | null
          name: string
          notes: string | null
          os: string | null
          owner_id: string | null
          status: Database["public"]["Enums"]["asset_status"]
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          criticality?: Database["public"]["Enums"]["criticality"]
          department_id?: string | null
          environment?: Database["public"]["Enums"]["environment"]
          hostname?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          name: string
          notes?: string | null
          os?: string | null
          owner_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          criticality?: Database["public"]["Enums"]["criticality"]
          department_id?: string | null
          environment?: Database["public"]["Enums"]["environment"]
          hostname?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          os?: string | null
          owner_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      business_services: {
        Row: {
          created_at: string
          criticality: Database["public"]["Enums"]["criticality"]
          department_id: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          sla_target: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          criticality?: Database["public"]["Enums"]["criticality"]
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          sla_target?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          criticality?: Database["public"]["Enums"]["criticality"]
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          sla_target?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_services_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          asset_id: string | null
          assigned_to: string | null
          created_at: string
          department_id: string | null
          description: string | null
          external_id: string
          host_id: string | null
          id: string
          provider_id: string
          raw: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          root_cause: string | null
          service_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_lifecycle"]
          title: string
          triggered_at: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          asset_id?: string | null
          assigned_to?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          external_id: string
          host_id?: string | null
          id?: string
          provider_id: string
          raw?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          service_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_lifecycle"]
          title: string
          triggered_at?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          asset_id?: string | null
          assigned_to?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          external_id?: string
          host_id?: string | null
          id?: string
          provider_id?: string
          raw?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          service_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_lifecycle"]
          title?: string
          triggered_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "monitoring_hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_events: {
        Row: {
          alert_id: string | null
          event_type: string | null
          external_id: string
          host_id: string | null
          id: string
          message: string | null
          occurred_at: string
          provider_id: string
          raw: Json | null
          severity: Database["public"]["Enums"]["alert_severity"] | null
        }
        Insert: {
          alert_id?: string | null
          event_type?: string | null
          external_id: string
          host_id?: string | null
          id?: string
          message?: string | null
          occurred_at?: string
          provider_id: string
          raw?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
        }
        Update: {
          alert_id?: string | null
          event_type?: string | null
          external_id?: string
          host_id?: string | null
          id?: string
          message?: string | null
          occurred_at?: string
          provider_id?: string
          raw?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"] | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_events_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "monitoring_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "monitoring_hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_events_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_host_groups: {
        Row: {
          created_at: string
          external_id: string
          id: string
          name: string
          provider_id: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          name: string
          provider_id: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          name?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_host_groups_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_hosts: {
        Row: {
          asset_id: string | null
          available: boolean | null
          created_at: string
          external_id: string
          hostname: string | null
          id: string
          ip_address: string | null
          last_seen: string | null
          name: string
          provider_id: string
          raw: Json | null
          status: string | null
          tags: Json
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          available?: boolean | null
          created_at?: string
          external_id: string
          hostname?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          name: string
          provider_id: string
          raw?: Json | null
          status?: string | null
          tags?: Json
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          available?: boolean | null
          created_at?: string
          external_id?: string
          hostname?: string | null
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          name?: string
          provider_id?: string
          raw?: Json | null
          status?: string | null
          tags?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_hosts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_hosts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_maps: {
        Row: {
          created_at: string
          external_id: string
          id: string
          layout: Json | null
          name: string
          provider_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          layout?: Json | null
          name: string
          provider_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          layout?: Json | null
          name?: string
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_maps_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_metrics: {
        Row: {
          external_id: string | null
          host_id: string | null
          id: string
          key: string
          provider_id: string
          raw: Json | null
          recorded_at: string
          unit: string | null
          value: number | null
        }
        Insert: {
          external_id?: string | null
          host_id?: string | null
          id?: string
          key: string
          provider_id: string
          raw?: Json | null
          recorded_at?: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          external_id?: string | null
          host_id?: string | null
          id?: string
          key?: string
          provider_id?: string
          raw?: Json | null
          recorded_at?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_metrics_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "monitoring_hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_metrics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_providers: {
        Row: {
          base_url: string | null
          config: Json
          created_at: string
          enabled: boolean
          health_score: number
          id: string
          kind: Database["public"]["Enums"]["provider_kind"]
          last_error: string | null
          last_sync_at: string | null
          name: string
          secret_ref: string | null
          status: Database["public"]["Enums"]["provider_status"]
          sync_interval_minutes: number
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          config?: Json
          created_at?: string
          enabled?: boolean
          health_score?: number
          id?: string
          kind: Database["public"]["Enums"]["provider_kind"]
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          secret_ref?: string | null
          status?: Database["public"]["Enums"]["provider_status"]
          sync_interval_minutes?: number
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          config?: Json
          created_at?: string
          enabled?: boolean
          health_score?: number
          id?: string
          kind?: Database["public"]["Enums"]["provider_kind"]
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          secret_ref?: string | null
          status?: Database["public"]["Enums"]["provider_status"]
          sync_interval_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_sync_logs: {
        Row: {
          details: Json | null
          duration_ms: number | null
          finished_at: string | null
          id: string
          message: string | null
          provider_id: string
          records_ingested: number
          result: Database["public"]["Enums"]["sync_result"]
          started_at: string
        }
        Insert: {
          details?: Json | null
          duration_ms?: number | null
          finished_at?: string | null
          id?: string
          message?: string | null
          provider_id: string
          records_ingested?: number
          result?: Database["public"]["Enums"]["sync_result"]
          started_at?: string
        }
        Update: {
          details?: Json | null
          duration_ms?: number | null
          finished_at?: string | null
          id?: string
          message?: string | null
          provider_id?: string
          records_ingested?: number
          result?: Database["public"]["Enums"]["sync_result"]
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_sync_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department_id: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_fk"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_health: {
        Row: {
          health_score: number
          id: string
          latency_ms: number | null
          message: string | null
          provider_id: string
          recorded_at: string
          status: Database["public"]["Enums"]["provider_status"]
        }
        Insert: {
          health_score: number
          id?: string
          latency_ms?: number | null
          message?: string | null
          provider_id: string
          recorded_at?: string
          status: Database["public"]["Enums"]["provider_status"]
        }
        Update: {
          health_score?: number
          id?: string
          latency_ms?: number | null
          message?: string | null
          provider_id?: string
          recorded_at?: string
          status?: Database["public"]["Enums"]["provider_status"]
        }
        Relationships: [
          {
            foreignKeyName: "provider_health_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "monitoring_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_assets: {
        Row: {
          asset_id: string
          id: string
          service_id: string
        }
        Insert: {
          asset_id: string
          id?: string
          service_id: string
        }
        Update: {
          asset_id?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assets_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_lifecycle:
        | "open"
        | "acknowledged"
        | "assigned"
        | "escalated"
        | "resolved"
        | "closed"
      alert_severity:
        | "info"
        | "warning"
        | "average"
        | "high"
        | "disaster"
        | "not_classified"
      app_role: "admin" | "operator" | "viewer" | "auditor" | "super_admin"
      asset_status: "active" | "maintenance" | "decommissioned" | "planned"
      asset_type:
        | "server"
        | "container"
        | "k8s_cluster"
        | "application"
        | "router"
        | "switch"
        | "database"
        | "load_balancer"
        | "storage"
      criticality: "low" | "medium" | "high" | "critical"
      dependency_type:
        | "depends_on"
        | "runs_on"
        | "connects_to"
        | "replicates_to"
      environment: "production" | "staging" | "development" | "dr"
      provider_kind:
        | "zabbix"
        | "grafana"
        | "prometheus"
        | "datadog"
        | "jira"
        | "slack"
        | "teams"
        | "huawei_nms"
        | "custom"
      provider_status:
        | "connected"
        | "disconnected"
        | "degraded"
        | "error"
        | "unconfigured"
      sync_result: "ok" | "partial" | "error" | "running"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_lifecycle: [
        "open",
        "acknowledged",
        "assigned",
        "escalated",
        "resolved",
        "closed",
      ],
      alert_severity: [
        "info",
        "warning",
        "average",
        "high",
        "disaster",
        "not_classified",
      ],
      app_role: ["admin", "operator", "viewer", "auditor", "super_admin"],
      asset_status: ["active", "maintenance", "decommissioned", "planned"],
      asset_type: [
        "server",
        "container",
        "k8s_cluster",
        "application",
        "router",
        "switch",
        "database",
        "load_balancer",
        "storage",
      ],
      criticality: ["low", "medium", "high", "critical"],
      dependency_type: [
        "depends_on",
        "runs_on",
        "connects_to",
        "replicates_to",
      ],
      environment: ["production", "staging", "development", "dr"],
      provider_kind: [
        "zabbix",
        "grafana",
        "prometheus",
        "datadog",
        "jira",
        "slack",
        "teams",
        "huawei_nms",
        "custom",
      ],
      provider_status: [
        "connected",
        "disconnected",
        "degraded",
        "error",
        "unconfigured",
      ],
      sync_result: ["ok", "partial", "error", "running"],
    },
  },
} as const
