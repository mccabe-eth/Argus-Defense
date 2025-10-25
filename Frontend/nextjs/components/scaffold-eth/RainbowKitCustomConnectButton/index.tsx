"use client";

// @refresh reset
import { Balance } from "../Balance";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  const networkColor = useNetworkColor();
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-cyber text-primary-foreground hover:opacity-90 h-9 rounded-md px-3 text-sm"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              return (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <Balance address={account.address as Address} className="min-h-0 h-auto text-sm" />
                      <span className="text-xs" style={{ color: networkColor }}>
                        {chain.name}
                      </span>
                    </div>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-card border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                    >
                      <span className="text-sm">
                        {account.displayName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                      </span>
                    </button>
                  </div>
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
