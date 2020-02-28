import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Filter, Pagination } from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: [{ state: 'all' }, { state: 'open' }, { state: 'closed' }],
    filterIndex: 0,
    pageIndex: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { filter, filterIndex, pageIndex } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter[filterIndex].state,
          per_page: 5,
          page: pageIndex,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { filter, filterIndex, pageIndex } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filter[filterIndex].state,
        per_page: 5,
        page: pageIndex,
      },
    });

    this.setState({ issues: issues.data });
  };

  handleFilter = async index => {
    console.log(index);
    await this.setState({ filterIndex: index });
    this.loadIssues();
  };

  handlePage = async cont => {
    const { pageIndex } = this.state;

    console.log(pageIndex);

    await this.setState({
      pageIndex: cont ? pageIndex + 1 : pageIndex - 1,
    });

    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filter,
      filterIndex,
      pageIndex,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Filter active={filterIndex}>
          {filter.map((f, index) => (
            <button
              type="button"
              key={f.state}
              onClick={() => this.handleFilter(index)}
            >
              {f.state}
            </button>
          ))}
        </Filter>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <Pagination>
          <button
            type="button"
            disabled={pageIndex === 1}
            onClick={() => this.handlePage(false)}
          >
            Back
          </button>

          <button type="button" onClick={() => this.handlePage(true)}>
            Next
          </button>
        </Pagination>
      </Container>
    );
  }
}
