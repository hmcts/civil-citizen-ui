module.exports = {
  getClaimFee: (amount) => {
    console.log('claim amount passed...', amount);
    switch(amount) {
      case '100':
        return {
          calculatedAmountInPence: '3500',
          code: 'FEE0202',
          version: '6',
        };
      case '300':
        return {
          calculatedAmountInPence: '3500',
          code: 'FEE0202',
          version: '6',
        };
      case '300.01':
        return {
          calculatedAmountInPence: '5000',
          code: 'FEE0203',
          version: '6',
        };
      case '400':
        return {
          calculatedAmountInPence: '5000',
          code: 'FEE0203',
          version: '6',
        };
      case '500':
        return {
          calculatedAmountInPence: '5000',
          code: 'FEE0203',
          version: '6',
        };
      case '500.01':
        return {
          calculatedAmountInPence: '7000',
          code: 'FEE0204',
          version: '6',
        };
      case '700':
        return {
          calculatedAmountInPence: '7000',
          code: 'FEE0204',
          version: '6',
        };
      case '999.99':
        return {
          calculatedAmountInPence: '7000',
          code: 'FEE0204',
          version: '6',
        };
      case '1000':
        return {
          calculatedAmountInPence: '7000',
          code: 'FEE0204',
          version: '6',
        };
      case '1000.01':
        return {
          calculatedAmountInPence: '8000',
          code: 'FEE0205',
          version: '6',
        };
      case '1200':
        return {
          calculatedAmountInPence: '8000',
          code: 'FEE0205',
          version: '6',
        };
      case '1499.99':
        return {
          calculatedAmountInPence: '8000',
          code: 'FEE0205',
          version: '6',
        };
      case '1500':
        return {
          calculatedAmountInPence: '8000',
          code: 'FEE0205',
          version: '6',
        };
      case '1500.01':
        return {
          calculatedAmountInPence: '115000',
          code: 'FEE0206',
          version: '6',
        };
      case '2000':
        return {
          calculatedAmountInPence: '115000',
          code: 'FEE0206',
          version: '6',
        };
      case '2999.99':
        return {
          calculatedAmountInPence: '115000',
          code: 'FEE0206',
          version: '6',
        };
      case '3000':
        return {
          calculatedAmountInPence: '115000',
          code: 'FEE0206',
          version: '6',
        };
      case '3000.01':
        return {
          calculatedAmountInPence: '205000',
          code: 'FEE0207',
          version: '6',
        };
      case '5000':
        return {
          calculatedAmountInPence: '205000',
          code: 'FEE0207',
          version: '6',
        };
      case '5000.01':
        return {
          calculatedAmountInPence: '455000',
          code: 'FEE0208',
          version: '6',
        };
      case '10000':
        return {
          calculatedAmountInPence: '455000',
          code: 'FEE0208',
          version: '6',
        };
      case '10000.01':
        return {
          calculatedAmountInPence: '500000', //Claim Amount - 10000.01 up to 200000 GBP. FEE AMOUNT = 5% of claim value
          code: 'FEE0209',
          version: '6',
        };
      case '11000':
        return {
          calculatedAmountInPence: '55000',
          code: 'FEE0209',
          version: '3',
        };
      case '15000':
        return {
          calculatedAmountInPence: '75000',
          code: 'FEE0209',
          version: '3',
        };
      case '30000':
        return {
          calculatedAmountInPence: '150000',
          code: 'FEE0209',
          version: '3',
        };
      case '150000':
        console.log('Use multi track claim fee');
        return {
          calculatedAmountInPence: '1000000',
          code: 'FEE0210',
          version: '4',
        };
      case '200000.01':
        console.log('More than 200000 '); //Money Claims - Claim Amount - 200000.01 GBP or more
        return {
          calculatedAmountInPence: '10000000',
          code: 'FEE0210',
          version: '4',
        };
      case '26000':
        console.log('Use intermediate track claim fee');
        return {
          calculatedAmountInPence: '495000',
          code: 'FEE0209',
          version: '3',
        };
      default:
        console.log('Please validate the claim amount passed');
    }
  },
};
