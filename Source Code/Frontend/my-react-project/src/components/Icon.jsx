import * as React from 'react';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';

// const ariaLabel = { 'aria-label': 'description' };

export default function Inputs(props) {
    const { defaultValue, ariaLabel, inputData } = props;
    // const val = inputData;
  return (
    <Box
      component="form"
      sx={{
        '& > :not(style)': { m: 1 },
      }}
      noValidate
      autoComplete="off"
    >
      <p>{inputData}</p>
    </Box>
  );
}