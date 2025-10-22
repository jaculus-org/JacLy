// import { enqueueSnackbar } from "notistack";

export const jacOut = {
  write: (msg: string) => {
    console.log('Jac STDOUT:', msg);
    // enqueueSnackbar(msg, { variant: 'info' });
  },
};

export const jacErr = {
  write: (msg: string) => {
    console.error('Jac STDERR:', msg);
    // enqueueSnackbar(msg, { variant: 'error' });
  },
};
