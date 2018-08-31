
const { expect } = require('chai');
const mongoose = require('mongoose');
const { getConfigForEnvironment } = require('../config/config.js');
const SpaceUsage = require('./space_usage.js');

describe('space_usage', () => {
  let config;
  let mockSpaceUsage;

  const ensureSpaceUsageCollectionEmpty = async () => {
    const spaceUsages = await SpaceUsage.find({});

    if (spaceUsages.length) {
      await SpaceUsage.collection.drop();
    }
  };

  const doesSaveSpaceUsageThrowError = async () => {
    const mongooseSpaceUsageBeforeSave = new SpaceUsage(mockSpaceUsage);
    try {
      await mongooseSpaceUsageBeforeSave.save();
      return false;
    } catch (error) {
      return true;
    }
  };

  before(async () => {
    config = getConfigForEnvironment(process.env.NODE_ENV);
    await mongoose.connect(config.spaceUsageDatabase.uri, { useNewUrlParser: true });
  });

  beforeEach(async () => {
    await ensureSpaceUsageCollectionEmpty();

    const usagePeriodStartTime = new Date('December 1, 2018 12:00:00').getTime();
    const usagePeriodEndTime = new Date('December 1, 2018 12:30:00').getTime();

    mockSpaceUsage = {
      spaceId: 'ID13413',
      usagePeriodStartTime,
      usagePeriodEndTime,
      numberOfPeopleRecorded: 5,
    };
  });

  after(async () => {
    await ensureSpaceUsageCollectionEmpty();
    mongoose.connection.close();
  });

  it('should save space usage when validation is successful', async function () {
    const spaceUsage = new SpaceUsage(mockSpaceUsage);
    const savedSpaceUsage = await spaceUsage.save();

    expect(savedSpaceUsage.usagePeriodStartTime.getTime())
      .to.equal(mockSpaceUsage.usagePeriodStartTime);
    expect(savedSpaceUsage.usagePeriodEndTime.getTime())
      .to.equal(mockSpaceUsage.usagePeriodEndTime);

    expect(savedSpaceUsage.spaceId).to.equal(mockSpaceUsage.spaceId);
    expect(savedSpaceUsage.numberOfPeopleRecorded).to.equal(mockSpaceUsage.numberOfPeopleRecorded);
  });

  it('should reject save if space id not provided', async function () {
    mockSpaceUsage.spaceId = '';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if usagePeriodStartTime not provided', async function () {
    mockSpaceUsage.usagePeriodStartTime = '';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if usagePeriodStartTime not in a date or epoch time format', async function () {
    mockSpaceUsage.usagePeriodStartTime = '1.3333';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if usagePeriodEndTime not provided', async function () {
    mockSpaceUsage.usagePeriodEndTime = '';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if usagePeriodEndTime not in a date or epoch time format', async function () {
    mockSpaceUsage.usagePeriodEndTime = '1.3333';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if number of people recorded not provided', async function () {
    mockSpaceUsage.numberOfPeopleRecorded = '';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });

  it('should reject save if number of people recorded is not a number', async function () {
    mockSpaceUsage.numberOfPeopleRecorded = 'sometext';
    const wasErrorThrown = await doesSaveSpaceUsageThrowError();

    expect(wasErrorThrown).to.equal(true);
  });
});

