import type {Config} from '../../../../../src/config.schema.ts'

export default {
  installation: {
    version: true,
  },
  configurationGuide: './extra/configuration.md',
  automationScript: './extra/automation.sh',
} satisfies Config
