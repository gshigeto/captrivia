import { Snackbar } from "@mui/material";
import { PropsWithChildren, createContext, useContext, useState } from "react";

export const SnackBarContext = createContext<{
  setSnackbarMessage: (message: string) => void;
}>({
  setSnackbarMessage: (message: string) => {
    throw new Error("Method not implemented");
  },
});

export const SnackBarProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [snackBarMessage, setSnackBarMessage] = useState<string>("");

  const setSnackbarMessage = (message: string) => {
    setSnackBarMessage(message);
  };

  return (
    <SnackBarContext.Provider
      value={{
        setSnackbarMessage,
      }}
    >
      {children}
      <Snackbar
        open={snackBarMessage !== ""}
        autoHideDuration={3000}
        onClose={() => setSnackBarMessage("")}
        message={snackBarMessage}
      />
    </SnackBarContext.Provider>
  );
};

export const useSnackBar = () => {
  return useContext(SnackBarContext);
};
