import { useDisconnect } from "wagmi";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <div className="mr-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive text-destructive-foreground text-sm">
        <span>Wrong network</span>
        <button className="ml-2 text-xs underline hover:no-underline" type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    </div>
  );
};
