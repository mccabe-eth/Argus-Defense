import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { Address } from "~~/components/scaffold-eth";

type AddressQRCodeModalProps = {
  address: AddressType;
  modalId: string;
};

export const AddressQRCodeModal = ({ address, modalId }: AddressQRCodeModalProps) => {
  return (
    <>
      <div className="hidden">
        <input type="checkbox" id={`${modalId}`} className="hidden" />
        <label
          htmlFor={`${modalId}`}
          className="fixed inset-0 z-50 bg-black/50 cursor-pointer hidden peer-checked:flex items-center justify-center"
        >
          <div className="bg-card border border-primary/20 rounded-lg p-6 max-w-md mx-4 relative">
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label htmlFor={`${modalId}`} className="absolute right-3 top-3 cursor-pointer text-2xl hover:text-primary">
              ✕
            </label>
            <div className="space-y-3 py-6">
              <div className="flex flex-col items-center gap-6">
                <QRCodeSVG value={address} size={256} />
                <Address address={address} format="long" disableAddressLink onlyEnsOrAddress />
              </div>
            </div>
          </div>
        </label>
      </div>
    </>
  );
};
