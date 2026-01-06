import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Config, ConfigSchema } from './config.schema';

@Injectable()
export class ConfigService implements OnModuleInit {
  private config: Config = {};
  private readonly configDir: string;
  private readonly configPath: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.tradeshell');
    this.configPath = path.join(this.configDir, 'config.json');
  }

  async onModuleInit() {
    // Load config when the module initializes
    const exists = await this.exists();
    if (exists) {
      await this.load();
    } else {
      await this.initEmpty();
    }
  }

  private async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  async load(): Promise<Config> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.config = ConfigSchema.parse(parsed);
      return this.config;
    } catch (error) {
      throw new Error(`Failed to load config: ${error}`);
    }
  }

  async save(config: Config): Promise<void> {
    try {
      // Ensure directory exists
      await fs.mkdir(this.configDir, { recursive: true });

      // Validate config
      const validated = ConfigSchema.parse(config);

      // Write to file
      await fs.writeFile(
        this.configPath,
        JSON.stringify(validated, null, 2),
        'utf-8',
      );

      this.config = validated;
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  get(): Config {
    return this.config;
  }

  async update(updates: Partial<Config>): Promise<Config> {
    const newConfig = { ...this.config, ...updates };
    await this.save(newConfig);
    return newConfig;
  }

  async updatePath(path: string, value: any): Promise<Config> {
    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(this.config)); // Deep clone

    let current: any = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    await this.save(newConfig);
    return newConfig;
  }

  private async initEmpty(): Promise<Config> {
    const emptyConfig: Config = {};
    await this.save(emptyConfig);
    return emptyConfig;
  }

  getConfigPath(): string {
    return this.configPath;
  }
}
