// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { padStart } from 'lodash';
import pseudoRandom from '../utils/pseudo-random';

export interface InstanceItem {
  id: string;
  name: string;
  url: string;
  state: ItemState;
  cpuCores: number;
  memoryGib: number;
  availabilityZone: string;
  replicas?: InstanceItem[];
}

type ItemState = 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING' | 'ERROR';
const states: ItemState[] = ['RUNNING', 'STOPPED', 'STARTING', 'STOPPING', 'ERROR'];

const CPUs = [2, 4, 8, 16, 32, 64];

const memory = [8, 16, 32, 64, 128, 192, 256];

const availabilityZones = [
  'us-east-1a',
  'us-east-1b',
  'us-east-1c',
  'us-east-1d',
  'us-east-1e',
  'us-east-2a',
  'us-east-2b',
  'us-east-2c',
  'us-west-1a',
  'us-west-1b',
  'us-west-1c',
  'us-west-2a',
  'us-west-2b',
  'us-west-2c',
  'eu-west-1a',
  'eu-west-1b',
  'eu-west-1c',
  'eu-central-1a',
  'eu-central-1b',
  'ap-northeast-1a',
  'ap-northeast-1b',
  'ap-northeast-1c',
  'ap-northeast-2a',
  'ap-northeast-2c',
  'ap-southeast-1a',
  'ap-southeast-1b',
  'ap-southeast-2a',
  'ap-southeast-2b',
  'ap-southeast-2c',
  'ap-south-1a',
  'ap-south-1b',
  'sa-east-1a',
  'sa-east-1b',
  'sa-east-1c',
];

interface GenerateInstancesProps {
  instances: number;
}

export function generateInstances({ instances: totalInstances }: GenerateInstancesProps): readonly InstanceItem[] {
  const instances: InstanceItem[] = [];

  for (let instanceId = 1; instanceId <= totalInstances; instanceId++) {
    const formattedInstanceId = padStart(instanceId.toString(), 8, '0');
    const instanceName = `instance-${formattedInstanceId}`;
    const instanceCPUs = CPUs[Math.floor(pseudoRandom() * CPUs.length)];
    const instanceMemory = memory[Math.floor(pseudoRandom() * memory.length)];
    const replicas: InstanceItem[] = [];
    const totalReplicas = Math.floor(pseudoRandom() * 12);

    for (let replicaId = 1; replicaId <= totalReplicas; replicaId++) {
      const formattedReplicaId = padStart(replicaId.toString(), 2, '0');
      const replicaName = `replica-${formattedInstanceId}-${formattedReplicaId}`;
      replicas.push({
        id: `${formattedInstanceId}-${formattedReplicaId}`,
        name: replicaName,
        url: `https://${replicaName}.com`,
        state: states[Math.floor(pseudoRandom() * states.length)],
        cpuCores: instanceCPUs,
        memoryGib: instanceMemory,
        availabilityZone: availabilityZones[Math.floor(pseudoRandom() * availabilityZones.length)],
      });
    }

    instances.push({
      id: formattedInstanceId,
      name: instanceName,
      url: `https://${instanceName}.com`,
      state: states[Math.floor(pseudoRandom() * states.length)],
      replicas,
      cpuCores: instanceCPUs,
      memoryGib: instanceMemory,
      availabilityZone: availabilityZones[Math.floor(pseudoRandom() * availabilityZones.length)],
    });
  }

  return instances;
}
