export enum InventoryTypeEnum{
     ANNUAL='annual',
     HALFYEARLY='half-yearly',
     QUARTERLY ='quarterly',
}

export const ListInventoryTypeEnum:InventoryTypeEnum[]=Object.values(InventoryTypeEnum).filter(value => typeof value === 'string') as InventoryTypeEnum[];