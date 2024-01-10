import { NormalizedLocale } from "../types"
import { readJsonSync } from "fs-extra"
import * as path from "path"
import { format } from "./index"

const DEFAULT_LOCALE_FILENAME = 'package.nls.json'

let instance: I18n

/**
 * Normalizes the locale string.
 */
export function normalize(locale: string | undefined): NormalizedLocale {
  switch (locale) {
    case "zh-cn":
    case "zh-CN":
      return NormalizedLocale.ZH_CN

    case "en":
    case "en-us":
    case "en-US":
    default:
      return NormalizedLocale.EN_US
  }
}

/**
 * Gets the normalized VSCode locale.
 */
export function getNormalizedVSCodeLocale(): NormalizedLocale {
  return normalize(getVSCodeLocale())
}

/**
 * Gets the VSCode locale string.
 */
export function getVSCodeLocale(): string | undefined {
  try {
    return JSON.parse(process.env.VSCODE_NLS_CONFIG || "{}").locale
  } catch (err) {
    return
  }
}

class I18n {
  private static instance: I18n

  private _bundle: Record<string, string>
  private _extensionPath: string
  private _locale: NormalizedLocale

  private constructor(extensionPath: string) {
    this._extensionPath = extensionPath
    this._locale = getNormalizedVSCodeLocale()
    this._bundle = this.prepare()
  }

  public static create(extensionPath: string): I18n {
    if (!I18n.instance || I18n.instance._extensionPath !== extensionPath) {
      I18n.instance = new I18n(extensionPath)
    }

    return I18n.instance
  }

  public get locale(): NormalizedLocale {
    return this._locale
  }

  public localize(key: string, ...templateValues: any[]): string {
    const message = this._bundle[key]

    if (templateValues.length > 0) {
      return format(message, ...templateValues)
    }

    return message
  }

  private prepare() {
    const filename = (this.locale === NormalizedLocale.EN_US) ? DEFAULT_LOCALE_FILENAME : `package.nls.${this.locale}.json`

    let bundle: Record<string, string>
    try {
      bundle = readJsonSync(
        path.resolve(this._extensionPath, filename)
        , { encoding: 'utf8' }
      )
    } catch (error) {
      bundle = readJsonSync(
        path.resolve(this._extensionPath, DEFAULT_LOCALE_FILENAME),
        { encoding: "utf8" }
      )
    }

    return bundle
  }
}

/**
 * Setup locale
 */
export function setupLocale(extensionPath: string): void {
  instance = I18n.create(extensionPath)
}

/**
 * 获取vscode的语言版本（EN_US | ZH_CN）
 */
export function locale(): NormalizedLocale {
  return instance.locale
}

/**
 * Get localize message
 */
export function localize(key: string, ...templateValues: any[]): string {
  return instance.localize(key, ...templateValues)
}