'use client';
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';

export function Navbar() {
    return (
        <div className="flex justify-between items-center p-4">
            <div className="text-2xl font-bold">Payeer</div>
            <div className="flex items-center gap-4">
                <Wallet>
                    <ConnectWallet>
                        <Avatar className="h-6 w-6" />
                        <Name />
                    </ConnectWallet>
                    <WalletDropdown>
                        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                            <Avatar />
                            <Name />
                            <Address />
                            <EthBalance />
                        </Identity>
                        <WalletDropdownDisconnect />
                    </WalletDropdown>
                </Wallet>
            </div>
        </div>
    );
}
