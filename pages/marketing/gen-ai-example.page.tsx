// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import Breadcrumbs from './components/breadcrumbs/breadcrumbs';
import Button from './components/button/button';
import Card from './components/card/card';
import Text from './components/text/text';
import Box from '~components/box';
import styles from './gen-ai-example.scss';
import { Grid, Link, SpaceBetween } from '~components';
import imagePlaceholder from '../container/images/9-16.png';

export default function DemoPage() {
  const toolsCardsData = [
    {
      title: 'Amazon Bedrock',
      body: 'The easiest way to build and scale generative AI applications with FMs',
    },
    {
      title: 'Amazon Sagemaker',
      body: 'Build, train, and deploy FMs at scale',
    },
    {
      title: 'Amazon CodeWhisperer',
      body: 'AI coding companion to build applications faster and more securely',
    },
  ];

  const learnMoreTitles = [
    'Demystifying LLMs with distinguished scientists',
    'Introduction to generative AI by Swami Sivasubramanian',
    'AI coding companions change how developers work',
  ];

  const imageCardsData = [
    {
      title: 'Technology Innovation Institute trains FM on Amazon SageMaker',
      badge: 'Blog',
      image: imagePlaceholder,
    },
    {
      title: 'AWS Cloud Adoption Framework for AI and ML ',
      badge: 'Whitepaper',
      image: imagePlaceholder,
    },
  ];

  return (
    <>
      <div className={styles.grid}>
        <div className={styles['col-8']}>
          <Breadcrumbs
            ariaLabel="Navigation"
            expandAriaLabel="Show path"
            items={['Generative AI', 'Technology'].map((text, i) => ({ text, href: `#item-${i}` }))}
          />
        </div>
        <div className={styles['col-8']}>
          <SpaceBetween size="l">
            <Box variant="h1" fontSize="display-l" fontWeight="bold">
              How to build and scale generative AI applications on AWS
            </Box>
            <Text type="subheading" size={1}>
              Innovate faster with new capabilities, choice of industry leading foundation models (FMs), and the most
              cost-effective infrastructure
            </Text>
          </SpaceBetween>
        </div>
        <div className={styles['col-8']}>
          <Button variant="primary">Sign up to get updates</Button>
        </div>
      </div>

      <div className={styles.page}>
        <Grid gridDefinition={[{ colspan: { default: 12, xs: 8 } }, { colspan: { default: 12, xs: 4 } }]}>
          <Text type="heading" size={2}>
            Tools for building generative AI applications
          </Text>
          <div className={styles['cta-link']}>
            <Link href="/" variant="primary">
              Find services for your use case
            </Link>
          </div>
        </Grid>
        <Grid gridDefinition={new Array(toolsCardsData.length).fill({ colspan: { default: 12, xxs: 6, xs: 4 } })}>
          {toolsCardsData.map((card, i) => (
            <Card key={i} ctaLink="#" title={card.title} body={card.body} />
          ))}
        </Grid>
      </div>

      <div className={styles.page}>
        <Grid gridDefinition={[{ colspan: { default: 12, xs: 8 } }]}>
          <Text type="heading" size={2}>
            Explore architectures and implementations for generative AI
          </Text>
        </Grid>
        <Grid gridDefinition={new Array(imageCardsData.length).fill({ colspan: { default: 12, xxs: 6 } })}>
          {imageCardsData.map((card, i) => (
            <Card key={i} ctaLink="#" title={card.title} badge={card.badge} image={card.image} />
          ))}
        </Grid>
      </div>

      <div className={styles.page}>
        <Grid gridDefinition={[{ colspan: { default: 12, xs: 8 } }]}>
          <Text type="heading" size={2}>
            Learn more about how generative AI works
          </Text>
        </Grid>
        <Grid gridDefinition={new Array(learnMoreTitles.length).fill({ colspan: { default: 12, xxs: 6, xs: 4 } })}>
          {learnMoreTitles.map((title, i) => (
            <Card key={i} ctaLink="#" title={title} badge="Article" color="fushia" />
          ))}
        </Grid>
      </div>
    </>
  );
}
