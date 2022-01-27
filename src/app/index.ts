import { Config } from "./game/Config";
import { Z2StriptBreakout } from "./ui/Z2StriptBreakout";
import { ConfigBuilder } from "./ui/ConfigBuilder";
import { isMobileOS } from "./ui/MobileDetection";
import "./ui/style/style.css";

export default function init(
  container: HTMLElement,
  userConfigFun: (isMobileOS: boolean) => Config
): Z2StriptBreakout | null {
  const config = new ConfigBuilder().build(userConfigFun(isMobileOS()));
  if (!config) {
    return null;
  }
  const runner = new Z2StriptBreakout(container, config);
  runner.start();
  return runner;
}
