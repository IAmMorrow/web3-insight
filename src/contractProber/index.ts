import { ethers } from "ethers"
import { ERC1155__factory, ERC20__factory, ERC721__factory } from "../contracts"
import { ContractMetadata, ContractType } from "../types/ContractType";

const ERC1155InterfaceId = "0xd9b67a26";
const ERC721InterfaceId = "0x80ac58cd";

export async function probeContract(address: string, provider: ethers.providers.BaseProvider): Promise<ContractType> {
    const erc20Contract = ERC20__factory.connect(address, provider);
    const erc721Contract = ERC721__factory.connect(address, provider);
    const erc1155Contract = ERC1155__factory.connect(address, provider);

    // try to check if it's a erc721

    const [
        isERC721,
        isERC1155,
        isERC20,
    ] = await Promise.allSettled([
        erc721Contract.supportsInterface(ERC721InterfaceId),
        erc1155Contract.supportsInterface(ERC1155InterfaceId),
        erc20Contract.symbol()
    ])

    if (isERC721.status === "fulfilled" && isERC721.value === true) {
        return ContractType.ERC721;
    }

    if (isERC1155.status === "fulfilled" && isERC1155.value === true) {
        return ContractType.ERC1155;
    }

    if (isERC20.status === "fulfilled" && typeof isERC20.value === "string") {
        return ContractType.ERC20;
    }

    return ContractType.UNKNOWN;
}

export async function getContractMetadata(address: string, contractType: ContractType, provider: ethers.providers.BaseProvider): Promise<ContractMetadata> {
    switch (contractType) {
        case ContractType.ERC20: {
            const erc20Contract = ERC20__factory.connect(address, provider);

            const [
                symbol,
                name,
                decimals
            ] = await Promise.all([
                erc20Contract.symbol(),
                erc20Contract.name(),
                erc20Contract.decimals()
            ])

            return {
                type: ContractType.ERC20,
                symbol,
                name,
                decimals,
            }
        }        
        case ContractType.ERC721: {
            const erc721Contract = ERC721__factory.connect(address, provider);

            const [
                symbol,
                name,
            ] = await Promise.all([
                erc721Contract.symbol(),
                erc721Contract.name(),
            ])

            return {
                type: ContractType.ERC721,
                symbol,
                name,
            }
        }        
        case ContractType.ERC1155: {
            return {
                type: ContractType.ERC1155,
            }
        }        
    }

    return {
        type: ContractType.UNKNOWN
    }
}