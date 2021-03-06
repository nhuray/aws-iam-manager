const bunyan = require('bunyan');
const Promise = require('bluebird');

class Policies {
  constructor (iam) {
    this.iam = iam;
    this.log = bunyan.createLogger({ name: 'policies' });
  }

  createPolicy (PolicyName, PolicyDocument) {
    this.log.info({ PolicyName, PolicyDocument }, 'Creating new policy...');

    return this.iam.createPolicy({
      PolicyName,
      PolicyDocument,
      Path: process.env.USERS_PATH,
    }).promise();
  }

  async getPolicy (PolicyName) {
    this.log.info({ PolicyName }, 'Getting policy...');

    const payload = await this.iam.listPolicies({
      PathPrefix: process.env.USERS_PATH,
    }).promise();

    return payload.Policies.filter(policy => policy.PolicyName === PolicyName);
  }

  async detachFromAllEntities (PolicyArn) {
    const entitiesWithAttachedPolicy = await this.iam.listEntitiesForPolicy({
      PolicyArn,
      PathPrefix: process.env.USERS_PATH,
    }).promise();

    const detachRequests = Promise.map(entitiesWithAttachedPolicy.PolicyGroups, group =>
      this.iam.detachGroupPolicy({
        GroupName: group.GroupName,
        PolicyArn
      }).promise(), { concurrency: 1 });

    this.log.info({ entitiesWithAttachedPolicy, PolicyArn }, 'Policy detached from requested entities');

    return detachRequests;
  }

  async removePolicy (PolicyArn) {
    this.log.info({ PolicyArn }, 'Deleting old policy...');
    await this.detachFromAllEntities(PolicyArn);
    return this.iam.deletePolicy({ PolicyArn }).promise();
  }

  async update (json) {
    this.log.info({ newData: json }, 'Updating policies');

    const data = await this.iam.listPolicies({
      PathPrefix: process.env.USERS_PATH,
    }).promise();

    this.log.info(data, 'Old Policies list');

    // Because we don't have ability to get current policies document and compare them
    // We have to remove all policies and re-create them from scratch.
    // Policies are also immutable, it's possible to version them but AWS limits version count to 5.
    const deleteResult = await Promise.map(
      data.Policies,
      policy => this.removePolicy(policy.Arn),
      { concurrency: 1 }
    );

    this.log.info({ deleteResult }, 'Old policies removed, creating new...');

    const createResult = await Promise.map(
      json.policies,
      policy => this.createPolicy(policy.name, JSON.stringify(policy.document)),
      { concurrency: 1 }
    );

    this.log.info({ createResult }, 'New policies created');

    return { createResult, deleteResult };
  }
}

module.exports = Policies;
