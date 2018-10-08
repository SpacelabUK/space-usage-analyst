const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const setUpMockGetRecordingsApiCall = require('./mock_get_recordings_api');
const setUpMockGetSpacesApiCall = require('./mock_get_spaces_api');
const setUpMockSaveSpaceUsageApiCall = require('./mock_save_space_usage_api');
const setPromisifiedTimeout = require('./promisified_timeout');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Space usage calculator', function () {
  let mockSpaces;
  let postSpaceUsageStub;
  let diContainer;
  let wifiRecordingsSpaceUsageCalculator;
  let calculateSpaceUsageParams;
  let spaceId1ExpectedSpaceUsageToBeCalculated;
  let spaceId2ExpectedSpaceUsageToBeCalculated;

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpCalculateSpaceUsageForTesting } = require('./calculate_space_usage_test_wiring');
    diContainer = wireUpCalculateSpaceUsageForTesting();
    wifiRecordingsSpaceUsageCalculator = diContainer.getDependency('wifiRecordingsSpaceUsageCalculator');
  };

  const setUpMockedExternalFunctions = () => {
    ({ mockSpaces } = setUpMockGetSpacesApiCall(diContainer));

    setUpMockGetRecordingsApiCall(diContainer);

    ({ postSpaceUsageStub } = setUpMockSaveSpaceUsageApiCall(diContainer));
  };

  const setUpParamsForSpaceUsageCalculation = () => {
    calculateSpaceUsageParams = {
      startTime: new Date('December 10, 2000 00:00:00').getTime(),
      endTime: new Date('December 10, 2000 00:15:00').getTime(),
      avgIntervalPeriodThatDeviceDetected: 15 * 60 * 1000,
    };
  };

  const setUpExpectedSpaceUsagesToBeCalculated = () => {
    spaceId1ExpectedSpaceUsageToBeCalculated = {
      numberOfPeopleRecorded: 2,
      usagePeriodStartTime: calculateSpaceUsageParams.startTime,
      usagePeriodEndTime: calculateSpaceUsageParams.endTime,
      occupancy: 0.5,
      spaceId: mockSpaces[0]._id,
    };

    spaceId2ExpectedSpaceUsageToBeCalculated = Object.assign({}, spaceId1ExpectedSpaceUsageToBeCalculated);
    spaceId2ExpectedSpaceUsageToBeCalculated.spaceId = mockSpaces[1]._id;
  };

  beforeEach(() => {
    setUpWifiRecordingsSpaceUsageCalculator();

    setUpParamsForSpaceUsageCalculation();

    setUpMockedExternalFunctions();

    setUpExpectedSpaceUsagesToBeCalculated();
  });

  context('when recording and spaces data to calculate usage is available from apis', function () {
    it('should calculate, for the specified timeframe, the space usage for each area', async function () {
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

      await setPromisifiedTimeout(1);

      const firstSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.firstCall.args[1];
      expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);

      const secondSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.secondCall.args[1];
      expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
    });

    it('should not duplicate space usage calculations (duplicates could be caused by space usage calculator adding duplicate listeners)', async function () {
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

      await setPromisifiedTimeout(1);

      const firstSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.firstCall.args[1];
      expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);
      expect(postSpaceUsageStub).to.have.callCount(4);

      const secondSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.secondCall.args[1];
      expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
    });
  });
});
