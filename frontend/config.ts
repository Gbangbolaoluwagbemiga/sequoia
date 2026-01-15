import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        coinbaseWallet({
            appName: 'Payeer',
        }),
    ],
    transports: {
        [baseSepolia.id]: http(),
    },
    ssr: true,
});
