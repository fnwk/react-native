/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {
  ReactNativeFeatureFlagsJsOnly,
  ReactNativeFeatureFlagsJsOnlyOverrides,
} from './ReactNativeFeatureFlags';

import NativeReactNativeFeatureFlags from './NativeReactNativeFeatureFlags';

const accessedFeatureFlags: Set<string> = new Set();
const overrides: ReactNativeFeatureFlagsJsOnlyOverrides = {};

export type Getter<T> = () => T;

function createGetter<T: boolean | number | string>(
  configName: string,
  customValueGetter: Getter<?T>,
  defaultValue: T,
): Getter<T> {
  let cachedValue: ?T;

  return () => {
    if (cachedValue == null) {
      accessedFeatureFlags.add(configName);
      cachedValue = customValueGetter() ?? defaultValue;
    }
    return cachedValue;
  };
}

export function createJavaScriptFlagGetter<
  K: $Keys<ReactNativeFeatureFlagsJsOnly>,
>(
  configName: K,
  defaultValue: ReturnType<ReactNativeFeatureFlagsJsOnly[K]>,
): Getter<ReturnType<ReactNativeFeatureFlagsJsOnly[K]>> {
  return createGetter(
    configName,
    () => overrides[configName]?.(),
    defaultValue,
  );
}

type NativeFeatureFlags = $NonMaybeType<typeof NativeReactNativeFeatureFlags>;

export function createNativeFlagGetter<K: $Keys<NativeFeatureFlags>>(
  configName: K,
  defaultValue: ReturnType<$NonMaybeType<NativeFeatureFlags[K]>>,
): Getter<ReturnType<$NonMaybeType<NativeFeatureFlags[K]>>> {
  return createGetter(
    configName,
    () => NativeReactNativeFeatureFlags?.[configName]?.(),
    defaultValue,
  );
}

export function getOverrides(): ?ReactNativeFeatureFlagsJsOnlyOverrides {
  return overrides;
}

export function setOverrides(
  newOverrides: ReactNativeFeatureFlagsJsOnlyOverrides,
): void {
  if (accessedFeatureFlags.size > 0) {
    const accessedFeatureFlagsStr = Array.from(accessedFeatureFlags).join(', ');
    throw new Error(
      `Feature flags were accessed before being overridden: ${accessedFeatureFlagsStr}`,
    );
  }

  Object.assign(overrides, newOverrides);
}
