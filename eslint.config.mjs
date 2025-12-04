import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/shared/supabase/types",
              message:
                "Import Supabase types from '@/shared/supabase' instead of the types file.",
            },
            {
              name: "src/shared/supabase/types",
              message:
                "Import Supabase types from '@/shared/supabase' instead of the types file.",
            },
            {
              name: "@/shared/supabase",
              importNames: ["Database", "Tables", "TablesInsert", "TablesUpdate", "Enums"],
              message:
                "Use table/enums aliases exported by '@/shared/supabase' (Appointment, Client, Service, AppointmentStatus, etc.) instead of raw Database/Tables helpers.",
            },
          ],
          patterns: [
            {
              group: ["**/shared/supabase/types", "**/src/shared/supabase/types"],
              message:
                "Import Supabase types from '@/shared/supabase' instead of the types file.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            "Database['public']['Enums']['status']":
              "Use AppointmentStatus from '@/shared/supabase'.",
            "Database['public']['Enums']['appointment_cancel_reason']":
              "Use AppointmentCancelReason from '@/shared/supabase'.",
          },
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSIndexedAccessType Identifier[name='Database']",
          message:
            "Use Supabase aliases from '@/shared/supabase' (e.g., Tables<'...'>, AppointmentStatus) instead of indexing Database directly.",
        },
      ],
    },
  },
  {
    files: ["src/__tests__/**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: [
      "src/shared/supabase/index.ts",
      "src/shared/supabase/types.ts",
      "src/shared/supabase/client-*.ts",
      "e2e/supabaseClient.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-types": "off",
      "no-restricted-syntax": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
