import React from "react";

// Props for the selected item. You can expand this as needed.
export interface GetStartedLineItemProps {
  itemName: string;
  itemDescription?: string;
  itemImageUrl?: string;
  price?: string;
}

// Main component to display the selected purchase item
export const GetStartedLineItem: React.FC<GetStartedLineItemProps> = ({
  itemName,
  itemDescription,
  itemImageUrl,
  price,
}) => {
  return (
    <div className="flex flex-row items-center justify-between w-full h-full p-4 lg:p-8 bg-white rounded-lg shadow-md z-2">
      {/* Image on the left */}
      <div className="flex-shrink-0 mr-6 bg-grey-700 rounded-lg flex items-center justify-center">
        {itemImageUrl && (
          <img
            src={itemImageUrl}
            alt={itemName}
            className="w-16 h-16 md:w-24 md:h-24 object-contain rounded-lg shadow-xl"
          />
        )}
      </div>
      {/* Title and description center */}
      <div className="flex flex-col flex-grow justify-center">
        <h2 className="text-2xl font-bold! text-gold-500! mb-1 drop-shadow-sm">{itemName}</h2>
        {/* Price below title on mobile, right on desktop */}
        {price && (
          <div className="block md:hidden text-xl! font-semibold! text-black! mb-2">{price}</div>
        )}
        {itemDescription && (
          <p className="hidden md:block text-gray-700! text-base! max-w-md">{itemDescription}</p>
        )}
      </div>
      {/* Price on the right for desktop */}
      <div className="flex-shrink-0 ml-6 hidden md:block">
        {price && (
          <div className="text-xl font-semibold text-black">{price}</div>
        )}
      </div>
    </div>
  );
};

export default GetStartedLineItem;
