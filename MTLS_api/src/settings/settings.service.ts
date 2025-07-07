import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {}

  /**
   * Create a new setting
   */
  async create(createSettingsDto: CreateSettingsDto): Promise<Settings> {
    const existingSetting = await this.settingsModel.findOne({ key: createSettingsDto.key }).exec();

    if (existingSetting) {
      // If the setting already exists, update it
      return this.update(createSettingsDto.key, createSettingsDto);
    }

    const newSetting = new this.settingsModel(createSettingsDto);
    return newSetting.save();
  }

  /**
   * Create or update multiple settings at once
   */
  async createMultiple(settingsArray: CreateSettingsDto[]): Promise<Settings[]> {
    const results = [];

    for (const settingDto of settingsArray) {
      const result = await this.create(settingDto);
      results.push(result);
    }

    return results;
  }

  /**
   * Find all settings
   */
  async findAll(): Promise<Settings[]> {
    return this.settingsModel.find().exec();
  }

  /**
   * Get public settings (non-secret ones)
   */
  async findPublicSettings(): Promise<Settings[]> {
    return this.settingsModel.find({ isSecret: false }).exec();
  }

  /**
   * Find setting by key
   */
  async findByKey(key: string): Promise<Settings> {
    const setting = await this.settingsModel.findOne({ key }).exec();

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return setting;
  }

  /**
   * Get the value of a setting by key
   */
  async getValueByKey(key: string): Promise<string> {
    const setting = await this.findByKey(key);
    return setting.value;
  }

  /**
   * Update setting by key
   */
  async update(key: string, updateSettingsDto: UpdateSettingsDto): Promise<Settings> {
    const updatedSetting = await this.settingsModel.findOneAndUpdate(
      { key },
      { ...updateSettingsDto, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updatedSetting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return updatedSetting;
  }

  /**
   * Delete setting by key
   */
  async remove(key: string): Promise<Settings> {
    const deletedSetting = await this.settingsModel.findOneAndDelete({ key }).exec();

    if (!deletedSetting) {
      throw new NotFoundException(`Setting with key "${key}" not found`);
    }

    return deletedSetting;
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<any> {
    const allSettings = await this.findPublicSettings();
    const result = {};

    // Group settings by their categories (using the first part of the key)
    allSettings.forEach(setting => {
      const [category, ...rest] = setting.key.split('.');

      if (!result[category]) {
        result[category] = {};
      }

      // Process nested keys
      if (rest.length > 0) {
        let current = result[category];
        const lastKey = rest.pop();

        rest.forEach(part => {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        });

        // Parse value based on type
        let parsedValue: any = setting.value;
        try {
          if (setting.type === 'number') {
            parsedValue = Number(setting.value);
          } else if (setting.type === 'boolean') {
            parsedValue = setting.value === 'true';
          } else if (setting.type === 'json') {
            parsedValue = JSON.parse(setting.value);
          }
        } catch (error) {
          console.error(`Error parsing setting ${setting.key} of type ${setting.type}:`, error);
        }

        current[lastKey] = parsedValue;
      } else {
        // Direct key under category
        try {
          if (setting.type === 'number') {
            result[category] = Number(setting.value);
          } else if (setting.type === 'boolean') {
            result[category] = setting.value === 'true';
          } else if (setting.type === 'json') {
            result[category] = JSON.parse(setting.value);
          } else {
            result[category] = setting.value;
          }
        } catch (error) {
          console.error(`Error parsing setting ${setting.key} of type ${setting.type}:`, error);
          result[category] = setting.value;
        }
      }
    });

    return result;
  }

  /**
   * Initialize default settings if not present
   */
  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'site.name',
        value: 'Music Theory Learning System',
        type: 'string',
        description: 'The name of the site displayed in header and title',
      },
      {
        key: 'site.description',
        value: 'An online platform for learning music theory',
        type: 'string',
        description: 'Site description used in metadata',
      },
      {
        key: 'site.adminEmail',
        value: 'admin@mtls.edu.vn',
        type: 'string',
        description: 'Email address of the administrator',
      },
      {
        key: 'site.timezone',
        value: 'Asia/Ho_Chi_Minh',
        type: 'string',
        description: 'Default timezone for the application',
      },
      {
        key: 'site.defaultLanguage',
        value: 'vi',
        type: 'string',
        description: 'Default language for the application',
      },
      {
        key: 'security.passwordMinLength',
        value: '8',
        type: 'number',
        description: 'Minimum length for passwords',
      },
      {
        key: 'security.loginAttempts',
        value: '5',
        type: 'number',
        description: 'Maximum number of login attempts before lockout',
      },
      {
        key: 'security.sessionTimeout',
        value: '60',
        type: 'number',
        description: 'Session timeout in minutes',
      },
      {
        key: 'security.enableTwoFactor',
        value: 'false',
        type: 'boolean',
        description: 'Whether two-factor authentication is enabled',
      },
      {
        key: 'storage.maxUploadSize',
        value: '10',
        type: 'number',
        description: 'Maximum upload size in MB',
      },
      {
        key: 'storage.allowedFileTypes',
        value: 'jpg,jpeg,png,pdf,mp3,wav',
        type: 'string',
        description: 'Comma-separated list of allowed file extensions',
      }
    ];

    for (const setting of defaultSettings) {
      try {
        // Only create if the setting doesn't exist
        const exists = await this.settingsModel.exists({ key: setting.key });
        if (!exists) {
          await this.create(setting as CreateSettingsDto);
        }
      } catch (error) {
        console.error(`Error initializing default setting ${setting.key}:`, error);
      }
    }
  }

  /**
   * Lấy cài đặt bảo mật
   */
  async getSecuritySettings(): Promise<any> {
    const securitySettings = {
      passwordMinLength: 8,
      loginAttempts: 5,
      sessionTimeout: 60,
      enableTwoFactor: false
    };

    try {
      // Lấy cài đặt từ database
      const passwordMinLengthSetting = await this.findByKey('security.passwordMinLength');
      const loginAttemptsSetting = await this.findByKey('security.loginAttempts');
      const sessionTimeoutSetting = await this.findByKey('security.sessionTimeout');
      const enableTwoFactorSetting = await this.findByKey('security.enableTwoFactor');

      // Cập nhật giá trị nếu tìm thấy
      if (passwordMinLengthSetting) {
        securitySettings.passwordMinLength = Number(passwordMinLengthSetting.value);
      }

      if (loginAttemptsSetting) {
        securitySettings.loginAttempts = Number(loginAttemptsSetting.value);
      }

      if (sessionTimeoutSetting) {
        securitySettings.sessionTimeout = Number(sessionTimeoutSetting.value);
      }

      if (enableTwoFactorSetting) {
        securitySettings.enableTwoFactor = enableTwoFactorSetting.value === 'true';
      }
    } catch (error) {
      console.log('Không tìm thấy cài đặt bảo mật, sử dụng giá trị mặc định');
    }

    return securitySettings;
  }
}
