import { createContext } from "react";

const headingContext = createContext({heading:0, zoom:0});

export default headingContext;

export const HeadingProvider = headingContext.Provider;
