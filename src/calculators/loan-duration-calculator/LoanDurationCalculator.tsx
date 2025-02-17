import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Box, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DurationResult } from '../../models/DurationResult';
import { calculateRoundedMonthsAndDays } from '../../utils/CountDays';

const LoanDurationCalculator = () => {
  const [durationResult, setDurationResult] = useState<DurationResult | null>(null);

  const formik = useFormik({
    initialValues: {
      startDate: null as Date | null,
      endDate: null as Date | null,
    },
    validationSchema: Yup.object({
      startDate: Yup.date().required('Start date is required'),
      endDate: Yup.date()
        .required('End date is required')
        .test('is-greater', 'End date must be greater than start date', function (value) {
          const { startDate } = this.parent;
          return value && startDate && new Date(value) > new Date(startDate);
        }),
    }),
    onSubmit: (values) => {
      const { startDate, endDate } = values;

      // Convert dates to string format (e.g., "YYYY-MM-DD")
      const startDateStr = startDate ? startDate.toISOString().split('T')[0] : '';
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : null;

      const duration: DurationResult = calculateRoundedMonthsAndDays(startDateStr, endDateStr);
      setDurationResult(duration);
    },
  });

  const handleReset = () => {
    formik.resetForm(); // Reset the form values
    setDurationResult(null); // Clear the duration result
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
        <DatePicker
          label="Start Date"
          value={formik.values.startDate}
          onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal',
              error: Boolean(formik.touched.startDate && formik.errors.startDate),
              helperText: formik.touched.startDate && formik.errors.startDate,
            },
          }}
        />
        <DatePicker
          label="End Date"
          value={formik.values.endDate}
          onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'normal',
              error: Boolean(formik.touched.endDate && formik.errors.endDate),
              helperText: formik.touched.endDate && formik.errors.endDate,
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button color="primary" variant="contained" type="submit">
            Calculate Duration
          </Button>
          <Button color="secondary" variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </Box>
      {durationResult && ( // Conditionally render the duration result
        <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6">Loan Duration:</Typography>
          <Typography variant="body1">
            {durationResult.totalMonths} month{durationResult.totalMonths > 1 ? 's' : null}
          </Typography>
          <Typography variant="body1">
            {durationResult.days} day{durationResult.days > 1 ? 's' : null}
          </Typography>
        </Box>
      )}
    </LocalizationProvider>
  );
};

export default LoanDurationCalculator;